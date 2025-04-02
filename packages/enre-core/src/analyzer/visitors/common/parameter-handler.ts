import traverseBindingPattern, {
  BindingPath,
  RecordConstructorFieldFromBindingPatternHookType
} from './binding-pattern-handler';
import {
  ENREEntityCollectionCallable,
  ENREEntityFile,
  ENREEntityFunction,
  ENREEntityMethod,
  ENREEntityParameter,
  ENRELogEntry,
  recordEntityParameter
} from '@enre-ts/data';
import {
  ArrowFunctionExpression,
  CatchClause,
  ClassMethod,
  ClassPrivateMethod,
  FunctionDeclaration,
  FunctionExpression,
  TSDeclareMethod
} from '@babel/types';
import {ENREContext} from '../../context';
import {ENRELocation} from '@enre-ts/location';
import ENREName from '@enre-ts/naming';
import {JSObjRepr} from './literal-handler';

declare interface raw_type{
  type_id:number,
  type_repr:string,
  type_name:string[],
}

function onRecord(
  name: string,
  location: ENRELocation,
  scope: ENREContext['scope'],
  path: BindingPath,
  defaultAlter: JSObjRepr,
  Type?:raw_type
) {
  if(Type===undefined){
    Type={
      type_id:-1,
      type_repr:'',
      type_name:['']
    };
  }
  const entity = recordEntityParameter(
    new ENREName('Norm', name),
    location,
    scope.last<ENREEntityCollectionCallable>(),
    //TODO:Type of param
    {typeID:Type.type_id,typeRepr:Type.type_repr,typeName:Type.type_name},
    {path, defaultAlter},
  );

  scope.last<ENREEntityFunction | ENREEntityMethod>().children.push(entity);

  return entity;
}

type HandleableNodeTypes =
  FunctionDeclaration
  | FunctionExpression
  | ArrowFunctionExpression
  | ClassMethod
  | ClassPrivateMethod
  | TSDeclareMethod
  | CatchClause;

export default function (
  node: HandleableNodeTypes,
  scope: ENREContext['scope'],
  logs: ENREEntityFile['logs'],
  onRecordField?: RecordConstructorFieldFromBindingPatternHookType
) {
  let params;
  if (node.type === 'CatchClause') {
    if (node.param) {
      params = [node.param];
    } else {
      return;
    }
  } else {
    params = node.params;
  }

  for (const [index, param] of Object.entries(params)) {
    if (param.type === 'Identifier' && param.name === 'this') {
      continue;
    }

    const prefix: BindingPath = [{type: 'array'}];
    if (param.type === 'RestElement') {
      prefix.push({type: 'rest', start: index});
    } else {
      prefix.push({type: 'key', key: index});
    }

    if (node.type === 'ClassMethod' && node.kind === 'constructor' && param.type === 'TSParameterProperty') {
      traverseBindingPattern<ENREEntityParameter>(
        param,
        scope,
        prefix,
        onRecord,
        onRecordField,
      );
    } else if (param.type === 'TSParameterProperty') {
      logs.add(node.loc!.start.line, ENRELogEntry['A parameter field is only allowed in a constructor implementation']);
      /**
       * In this case, only (and should only) extract parameter entities.
       * By not sending onRecordField, the function will not record any field entities.
       */
      traverseBindingPattern<ENREEntityParameter>(
        param,
        scope,
        prefix,
        onRecord,
      );
    } else {
      traverseBindingPattern<ENREEntityParameter>(
        param,
        scope,
        prefix,
        onRecord,
      );
    }
  }
}
