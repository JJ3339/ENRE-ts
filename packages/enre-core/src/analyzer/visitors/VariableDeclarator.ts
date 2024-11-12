/**
 * VariableDeclarator
 *
 * Extracted entities:
 *   * Variable
 *
 * Extracted relations:
 *   * Set @init=true
 */

import {NodePath} from '@babel/traverse';
import {ForOfStatement, traverse, TSTypeAnnotation, VariableDeclaration, VariableDeclarator} from '@babel/types';
import {
  ENREEntityCollectionAnyChildren,
  ENREEntityClass,
  ENREEntityVariable,
  postponedTask,
  recordEntityVariable,
  recordRelationSet,
} from '@enre-ts/data';
import {ENRELocation} from '@enre-ts/location';
import {ENREContext} from '../context';
import traverseBindingPattern from './common/binding-pattern-handler';
import ENREName from '@enre-ts/naming';
import {variableKind} from '@enre-ts/shared';
import resolveJSObj, {JSMechanism, JSObjRepr, createJSObjRepr} from './common/literal-handler';
import expressionHandler, {
  AscendPostponedTask,
  DescendPostponedTask
} from './common/expression-handler';


const buildOnRecord = (kind: variableKind, typeName: string|undefined ,instanceName: string|undefined ,
  hasInit: any) => {
  return (name: string, location: ENRELocation, scope: ENREContext['scope']) => {
    const entity = recordEntityVariable(
      new ENREName('Norm', name),
      location,
      scope.last(),
      {kind},
      typeName,
      instanceName
    );

    // scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
    // scope.push(entity);

    if (!!hasInit) {
      // Record relation `set`
      recordRelationSet(
        scope.last(),
        entity,
        location,
        {isInit: true},
      );

      if(hasInit.kv){
        //判断是否设置作用域
        scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
        scope.push(entity);
        entity.isValidThis = true;
        isScope = true;
      }
      
    }

    return entity;
  };
};

type PathType = NodePath<VariableDeclarator>
let isScope:boolean
export default {
  enter: (path: PathType, {scope, modifiers}: ENREContext) => {
    isScope = false;
    const kind = (path.parent as VariableDeclaration).kind;
    const declarator: VariableDeclarator = path.node as VariableDeclarator;
    let objRepr: JSMechanism | DescendPostponedTask | undefined = resolveJSObj(declarator.init);
    // The init value is not a literal, but an expression.
    let instanceName = undefined
    if (declarator.init && !objRepr) {
    objRepr = expressionHandler(declarator.init, scope);
    instanceName = undefined
    }
    
    // ForStatement is not supported due to the complexity of the AST structure.
    if (['ForOfStatement', 'ForInStatement'].includes(path.parentPath.parent.type)) {
    objRepr = resolveJSObj((path.parentPath.parent as ForOfStatement).right);
    }

    const typeAnnotation: TSTypeAnnotation|undefined = Reflect.get(declarator.id, 'typeAnnotation')?.typeAnnotation
    // const typeName = Reflect.get(typeAnnotation, 'typeName').name
    let typeName = undefined
    if (typeAnnotation){
        typeName = Reflect.get(typeAnnotation, 'typeName').name
    }
    // const typeName = typeAnnotation?.typeName?.name ?? undefined;
    
    const returned = traverseBindingPattern<ENREEntityVariable>(
    declarator.id,
    scope,
    undefined,
    buildOnRecord(kind as variableKind, typeName, instanceName, objRepr),
    );
    // returned[0].entity.pointsTo.push(createJSObjRepr('obj'));
    if (returned && objRepr) {
    let variant: 'for-of' | 'for-await-of' | 'for-in' | undefined = undefined;
    if (path.parentPath.parent.type === 'ForOfStatement') {
        variant = 'for-of';
        if (path.parentPath.parent.await) {
        variant = 'for-await-of';
        }
    } else if (path.parentPath.parent.type === 'ForInStatement') {
        variant = 'for-in';
    }
    if ('callable' in objRepr){
        objRepr.callable.push({
        entity: undefined,
        returns: [returned[0].entity],
        });
    }
    // 确保 objRepr.callable 是一个数组
    // if (!('callable' in objRepr)) {
    //   objRepr.callable = [];
    // }
    // objRepr.callable.push({
    //   entity: returned[0].entity,
    //   returns: [returned[0].entity],
    // });

    if (objRepr.type === 'descend') {
        objRepr.onFinish = (resolvedResult) => {
        if (resolvedResult.length >= 1) {
            postponedTask.add({
            type: 'ascend',
            payload: [{
                operation: 'assign',
                operand0: returned,
                // FIXME: Temporary only pass one resolved element, but it should be an array.
                operand1: resolvedResult[0],
                variant,
            }]
            } as AscendPostponedTask);

            return true;
        } else {
            return false;
        }
        };
    } else {
        postponedTask.add({
        type: 'ascend',
        payload: [{
            operation: 'assign',
            operand0: returned,
            operand1: objRepr,
            variant,
        }],
        scope: scope.last(),
        } as AscendPostponedTask);
    }
    }
    
    /**
     * Setup to extract properties from object literals,
     * which expects id to be an identifier.
     *
     * (BindingPattern will be supported by hidden dependency extraction.)
     */
    // if (declarator.id.type === 'Identifier') {
    //   if (declarator.init?.type === 'ObjectExpression') {
    //     if (returned) {
    //       scope.push(returned);
    
    //       const key = `${path.node.loc!.start.line}:${path.node.loc!.start.column}`;
    //       modifiers.set(key, ({
    //         type: ModifierType.acceptProperty,
    //         proposer: returned,
    //       }));
    //     }
    //   }
    // }
  },

  exit: (path: PathType, {scope, modifiers}: ENREContext) => {
    console.log('exit var');
    if(scope.last().type === 'variable' && isScope){
      scope.pop()
    }
    // const varEntity = scope.last<ENREEntityClass>();
    // if (varEntity.pointsTo[0].callable.length === 0) {
    //   varEntity.pointsTo[0].callable.push({
    //     entity: varEntity,
    //     /**
    //      * Temporary assign the return value of a new call to a class to be itself.
    //      * TODO: Truly resolve the return value of a new call to a class with the respect
    //      * of constructor's return value.
    //      */
    //     returns: [varEntity],
    //   });
    // }  
    // const length = path.node.declarations.length;
    // for (let i = 0; i < length; i++) {
    //     scope.pop();
    // }
    // for (const declarator of path.node.declarations) {
    //   if(declarator.init){
    //     scope.pop()
    //   }
    // }
    // scope.pop();
    // const varEntity = scope.last<ENREEntityClass>();
    // varEntity.children.forEach(f => {
    //   if(f.type === 'function' || f.type === 'method'){
    //     varEntity.pointsTo[0].callable.push({
    //       entity: f,
    //       /**
    //        * Temporary assign the return value of a new call to a class to be itself.
    //        * TODO: Truly resolve the return value of a new call to a class with the respect
    //        * of constructor's return value.
    //        */
    //       returns: [f],
    //     });
    //   }
    // })
    // if (path.node.declarator.id.type === 'Identifier') {
    //   if (declarator.init?.type === 'ObjectExpression') {
    //   }
    // }
    // const key = `${path.node.loc!.start.line}:${path.node.loc!.start.column}`;
    // modifiers.delete(key);
  }
};
