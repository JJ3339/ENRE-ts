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
import {ForOfStatement, traverse, TSTypeAnnotation, VariableDeclaration,TSTypeReference, Identifier, TSType, VariableDeclarator} from '@babel/types';
import {
  ENREEntityCollectionAnyChildren,
  ENREEntityClass,
  ENREEntityVariable,
  postponedTask,
  recordEntityVariable,
  recordRelationSet,
  literalTypes
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
import { cloneDeep } from 'lodash';

declare interface raw_type{
  type_id:number,
  type_repr:string,
  type_name:string[],
}
//输入一个基础类，输出其type名
function Primitive_Type(annotation:TSType):string{
  if (annotation.type === 'TSStringKeyword') {
    return 'string';
  } else if (annotation.type === 'TSNumberKeyword') {
    return 'number';
  } else if (annotation.type === 'TSBooleanKeyword') {
    return 'boolean';
  } else if (annotation.type === 'TSNullKeyword') {
    return 'null';
  } else if (annotation.type === 'TSBigIntKeyword') {
    return 'bigint';
  } else if (annotation.type === 'TSUndefinedKeyword') {
    return 'undefined';
  } else if (annotation.type === 'TSArrayType') {
    return Primitive_Type(annotation.elementType)+'[]';
  } else if (annotation.type === 'TSTypeReference') {
    ID += 1; // 保留ID的修改逻辑
    return ((annotation as TSTypeReference).typeName as Identifier).name;
  } else {
    return '';
  }
}
export function Type_is(annotation:TSType|undefined,ID:number):raw_type{
  const type_annotation=annotation?.type;
  let number_id;
  const string_name=[];
  switch (type_annotation) {
    case 'TSStringKeyword':
      number_id=1;string_name.push('string');break;
    case 'TSNumberKeyword':
      number_id=2;string_name.push('number');break;
    case 'TSBooleanKeyword':
      number_id=3;string_name.push('boolean');break;
    case 'TSNullKeyword':
      number_id=4;string_name.push('null');break;
    case 'TSBigIntKeyword':
      number_id=5;string_name.push('bigint');break;
    case 'TSUndefinedKeyword':
      number_id=6;string_name.push('undefined');break;
    case 'TSTypeReference':
      ID+=1;number_id=ID;//TODO：目前处理方式是直接id+1，最后转为TENET需要根据名字重新定义id
      string_name.push(((annotation as TSTypeReference).typeName as Identifier).name);
      break;
    case 'TSArrayType':
      number_id=0;
      string_name.push(Primitive_Type(annotation.elementType)+'[]');
      break;
    case 'TSUnionType':
      number_id=-1;//组合类型
      for(const e of annotation.types){
        string_name.push(Primitive_Type(e));
      }
      break;
    case undefined:
      number_id=6;
        //DO Nothing
      break;
    default: {
      //logger.info('type_annotation is undefined');
      number_id=6;
      //string_name.push('');
      break;
    }
  }

  return {
    type_id:number_id,
    type_repr:'',
    type_name:string_name,
  };
}
const buildOnRecord = (kind: variableKind, typeName: string|undefined ,instanceName: string|undefined ,
  hasInit: any,Type:raw_type) => {
  return (name: string, location: ENRELocation, scope: ENREContext['scope']) => {
    const entity = recordEntityVariable(
      new ENREName('Norm', name),
      location,
      scope.last(),
      {kind},
      {typeID:Type.type_id,typeRepr:Type.type_repr,typeName:Type.type_name},
      typeName,
      instanceName
    );

    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);

    if (!!hasInit) {
      // Record relation `set`
      recordRelationSet(
        scope.last(),
        entity,
        location,
        {isInit: true},
      );

      if(hasInit.kvInitial === 'object'){
        //判断是否设置作用域
        scope.push(entity);
        entity.isValidThis = true;
        isScope = true;
      }

    }

    return entity;
  };
};
let ID=6;
type PathType = NodePath<VariableDeclarator>
let isScope:boolean;
export default {
  enter: (path: PathType, {scope, modifiers}: ENREContext) => {
    isScope = false;
    const kind = (path.parent as VariableDeclaration).kind;
    const declarator: VariableDeclarator = path.node as VariableDeclarator;
    let objRepr: JSMechanism | DescendPostponedTask | undefined = resolveJSObj(declarator.init);
    // The init value is not a literal, but an expression.
    let instanceName = undefined;
    if (declarator.init && !objRepr) {
      objRepr = expressionHandler(declarator.init, scope);

    if (declarator.init.type == 'NewExpression'){
      //instanceName = declarator.init.callee.name;
    }
    instanceName = undefined;
    }
    // ForStatement is not supported due to the complexity of the AST structure.
    if (['ForOfStatement', 'ForInStatement'].includes(path.parentPath.parent.type)) {
        objRepr = resolveJSObj((path.parentPath.parent as ForOfStatement).right);
    }

    const typeAnnotation: TSTypeAnnotation|undefined = Reflect.get(declarator.id, 'typeAnnotation')?.typeAnnotation;
    // const typeName = Reflect.get(typeAnnotation, 'typeName').name
    const typeName = undefined;
    // if (typeAnnotation){
    //     typeName = Reflect.get(typeAnnotation, 'typeName').name
    // }
    // const typeName = typeAnnotation?.typeName?.name ?? undefined;

    let annotation;
    if ('typeAnnotation' in declarator.id) {
      annotation = (declarator.id.typeAnnotation as TSTypeAnnotation).typeAnnotation;
    }
    const types=Type_is(annotation,ID);
    if(types.type_id>=ID)ID+=1;

    // 未进行类型注解
    // TODO: 查看objRepr的各种情况
    if ( types.type_name.length === 0 && objRepr ){
      if ( literalTypes.includes(objRepr.type)){
        types.type_name.push(objRepr.type);
      } else if(objRepr.type === 'object'){
          
      }
    }

    const returned = traverseBindingPattern<ENREEntityVariable>(
        declarator.id,
        scope,
        undefined,
        buildOnRecord(kind as variableKind, typeName, instanceName, objRepr, types),
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
        if (path.parentPath.parent.type === 'BlockStatement'){
          objRepr.isBranch = true;
        }
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
      scope.pop();
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
