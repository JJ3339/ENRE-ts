import {
  Identifier,
  LVal,
  PatternLike,
  TSParameterProperty,
  TSType, TSTypeAnnotation,
  TSTypeReference
} from '@babel/types';
import {ENREEntityField, ENREEntityParameter, ENREEntityVariable} from '@enre-ts/data';
import {ENRELocation, toENRELocation} from '@enre-ts/location';
import {ENREContext} from '../../context';
import {TSVisibility} from '@enre-ts/shared';
import {ENREScope} from '../../context/scope';
import resolveJSObj, {JSMechanism} from './literal-handler';

declare interface raw_type{
  type_id:number,
  type_repr:string,
  type_name:string[],
}
export let ID=6;
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

type PossibleEntityTypes = ENREEntityVariable | ENREEntityParameter | ENREEntityField;

type BindingRepr<T extends PossibleEntityTypes> = {
  path: BindingPath,
  entity: T | ENREEntityField,
  default?: JSMechanism
};

export type BindingPath = (
  BindingPathStart
  | BindingPathObj
  | BindingPathObjKey
  | BindingPathObjRest
  | BindingPathArray
  | BindingPathArrayIndex
  | BindingPathArrayRest
  )[];

type BindingPathStart = { type: 'start' };
type BindingPathObj = { type: 'obj' };
type BindingPathObjKey = { type: 'key', key: string | number };
type BindingPathObjRest = { type: 'rest', exclude: string[] };
type BindingPathArray = { type: 'array' };
type BindingPathArrayIndex = { type: 'key', key: string | number };
type BindingPathArrayRest = { type: 'rest', start: string | number };

export type BindingPathRest = BindingPathObjRest | BindingPathArrayRest;

export type RecordEntityFromBindingPatternHookType<T> = (
  name: string,
  location: ENRELocation,
  scope: ENREContext['scope'],
  path: BindingPath,
  defaultAlter: any,
  Type?:raw_type,
) => T

export type RecordConstructorFieldFromBindingPatternHookType = (
  name: string,
  location: ENRELocation,
  scope: ENREScope,
  TSVisibility: TSVisibility,
) => ENREEntityField

export default function <T extends PossibleEntityTypes>(
  id: PatternLike | LVal | TSParameterProperty,
  scope: ENREContext['scope'],
  overridePrefix: BindingPath | undefined,
  onRecord: RecordEntityFromBindingPatternHookType<T>,
  onRecordConstructorField?: RecordConstructorFieldFromBindingPatternHookType,
): BindingRepr<T>[] {
  return recursiveTraverse(id, overridePrefix ?? [{type: 'start'}]).map(item => {
    /**
     * If the AST node represents a TypeScript constructor parameter field,
     * a field entity (of the class entity) and a field entity with the same name & location
     * (of the constructor entity) are created, and only the parameter entity is returned.
     */
    if (id.type === 'TSParameterProperty') {
      onRecordConstructorField ? onRecordConstructorField(
        item.name,
        item.location,
        scope,
        id.accessibility!
      ) : undefined;
    }

    return {
      path: item.path,
      entity: onRecord(
        item.name,
        item.location,
        scope,
        item.path,
        item.default,
        item.type
      ),
      default: item.default,
    };
  });
}

function recursiveTraverse(
  id: PatternLike | LVal | TSParameterProperty,
  prefix: BindingPath,
): {
  path: BindingPath,
  name: string,
  location: ENRELocation,
  default?: JSMechanism,
  type?:raw_type
}[] {
  // TODO: Snapshot test this function based on test cases in /docs/entity/variable.md

  const result = [];

  switch (id.type) {
    case 'Identifier': {
      const _prefix = [...prefix];
      if (!(
        // Do not add identifier name to path if it is not a destructuring pattern
        (prefix.length === 1 && prefix[0].type === 'start')
        // Do not add identifier name if it is an array pattern
        || prefix.at(-2)?.type === 'array'
        // Do not add identifier name if it is an object value
        || prefix.at(-2)?.type === 'obj'
      )) {
        _prefix.push({type: 'key', key: id.name});
      }
      let types;
      if ('typeAnnotation' in id) {
        const annotation = (id.typeAnnotation as TSTypeAnnotation).typeAnnotation;
        types=Type_is(annotation,ID);
      }
      result.push({
        path: _prefix,
        name: id.name,
        location: toENRELocation(id.loc),
        types
      });
      break;
    }

    case 'AssignmentPattern': {
      for (const item of recursiveTraverse(id.left, prefix)) {
        item.default = resolveJSObj(id.right) as JSMechanism;
        result.push(item);
      }
      break;
    }

    case 'ObjectPattern': {
      const usedProps: (string | number)[] = [];
      for (const property of id.properties) {
        if (property.type === 'RestElement') {
          // Its argument can ONLY be Identifier
          const _prefix = [...prefix];
          _prefix.push(...[{type: 'obj'} as BindingPathObj, {
            type: 'rest',
            exclude: usedProps.map(num => num.toString())
          } as BindingPathObjRest]);
          for (const item of recursiveTraverse(property.argument, _prefix)) {
            result.push(item);
          }
        } else {
          // TODO: Unified get key

          const _prefix = [...prefix, {type: 'obj'}];
          if (property.key.type === 'Identifier' &&
            ((property.value.type === 'Identifier' && property.key.name !== property.value.name) ||
              property.value.type !== 'Identifier')) {
            // @ts-ignore
            usedProps.push(property.key.name ?? property.key.value);
            _prefix.push({type: 'key', key: property.key.name});
          } else if (property.key.type === 'NumericLiteral') {
            usedProps.push(property.key.value);
            _prefix.push({type: 'key', key: property.key.value});
          } else if (property.key.type === 'StringLiteral') {
            usedProps.push(property.key.value);
            _prefix.push({type: 'key', key: property.key.value});
          }
          // property.type === 'ObjectProperty'
          // @ts-ignore
          for (const item of recursiveTraverse(property.value, _prefix)) {
            result.push(item);
          }
        }
      }
      break;
    }

    case 'ArrayPattern':
      for (const element of id.elements) {
        if (element === null) {
          result.push(undefined);
        } else if (element.type === 'RestElement') {
          // Its argument can STILL be a pattern
          // Rest operator can be used with comma elision, elements before the rest operator are not put into the rest variable
          const _prefix = [...prefix];
          _prefix.push(...[{type: 'array'}, {
            type: 'rest',
            start: result.length.toString()
          }] as const);
          for (const item of recursiveTraverse(element.argument, _prefix)) {
            result.push(item);
          }
        } else {
          // element.type === 'PatternLike'
          const _prefix = [...prefix];
          _prefix.push(...[{type: 'array'}, {
            type: 'key',
            key: result.length.toString()
          }] as const);
          for (const item of recursiveTraverse(element, _prefix)) {
            result.push(item);
          }
        }
      }
      break;

    case 'TSParameterProperty':
      if (id.parameter.type === 'Identifier') {
        result.push(...recursiveTraverse(id.parameter, prefix));
      }
      // id.parameter.type === 'AssignmentPattern'
      else {
        if (id.parameter.left.type === 'Identifier') {
          result.push(...recursiveTraverse(id.parameter.left, prefix));
        } else if (['ArrayPattern', 'ObjectPattern'].includes(id.parameter.left.type)) {
          // Indeed invalid syntax
          result.push(...recursiveTraverse(id.parameter.left, prefix));
        } else {
          // console.warn(`Unhandled BindingPattern type ${id.parameter.left.type}`);
        }
      }
      break;

    /**
     * For callable's rest parameters only.
     * Regular object and array's rest are handled in their own case branch.
     */
    case 'RestElement':
      for (const item of recursiveTraverse(id.argument, prefix)) {
        result.push(item);
      }
  }

  // Remove `undefined` (placeholder for array destructuring with comma elision)
  return result.filter(item => item !== undefined) as ReturnType<typeof recursiveTraverse>;
}
