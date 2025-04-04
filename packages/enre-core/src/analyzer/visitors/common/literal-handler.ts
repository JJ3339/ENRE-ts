import {Expression} from '@babel/types';
import {
  ENRELocation,
  ENRELocKey,
  toENRELocation,
  ToENRELocationPolicy,
  toENRELocKey
} from '@enre-ts/location';
import {BindingPathRest} from './binding-pattern-handler';
import {ENREEntityFunction, ENREEntityMethod, ENREEntityVariable} from '@enre-ts/data';
import expressionHander from './expression-handler'
import { DescendPostponedTask } from './expression-handler';
import { ENREContext } from '../../context';

export type JSMechanism =
  JSReference
  | JSObjRepr
  | JSReceipt
  | JSStringLiteral
  | JSNumberLiteral
  | JSBooleanLiteral;

export interface JSReference {
  type: 'reference',
  value: string,
  location: ENRELocation,
  isBranch?: Boolean
}

export interface JSReceipt {
  type: 'receipt',
  key: ENRELocKey,
  isBranch?: Boolean
}

export interface JSCallable {
  entity: ENREEntityFunction | ENREEntityMethod | undefined,
  returns: any[],
  isBranch?: Boolean
}

export interface JSStringLiteral {
  type: 'string',
  value: string,
  isBranch?: Boolean
}

export interface JSNumberLiteral {
  type: 'number',
  value: number,
  isBranch?: Boolean
}

export interface JSBooleanLiteral {
  type: 'boolean',
  value: boolean,
  isBranch?: Boolean
}

export interface JSObjRepr {
  // To distinguish from other ENREEntity types
  type: 'object',
  // Object literal keys as well as array literal indices
  kv: {
    // ENREEntity as symbol
    // TODO: All kvs should also be array (array should be range-based for path sensitivity)
    [key: string]: JSMechanism,
  },
  // This object is declared as an object literal or an array literal
  // This affects how ...(rest operator) works on keys
  kvInitial: 'obj' | 'array',
  // TODO: Change undefined to the basic JS object
  prototype: JSMechanism | undefined,
  // A compound representation for callables
  callable:
  // Normal call to functions, record in show-up order where index is the key
    JSCallable[] & {
    // Symbol.iterator
    iterator?: JSCallable[],
    // Symbol.asyncIterator
    asyncIterator?: JSCallable[],
  },
  isBranch?: Boolean
}


export function createJSObjRepr(kvInitial: JSObjRepr['kvInitial']): JSObjRepr {
  return {
    type: 'object',
    kv: {},
    kvInitial,
    prototype: undefined,
    callable: [],
  };
}

export default function resolve(node: Expression | null | undefined, scope?: ENREContext['scope']): JSMechanism | DescendPostponedTask | undefined {
  if (!node) {
    return undefined;
  }

  if (node.type === 'Identifier') {
    return {
      type: 'reference',
      value: node.name,
      location: toENRELocation(node.loc, ToENRELocationPolicy.PartialEnd)
    };
  } else if (node.type === 'ArrayExpression') {
    const objRepr = createJSObjRepr('array');

    for (const [index, element] of Object.entries(node.elements)) {
      // @ts-ignore
      const resolved = resolve(element);
      if (resolved) {
        // @ts-ignore
        objRepr.kv[index] = resolved;
      }
    }
    return objRepr;
  } else if (node.type === 'ObjectExpression') {
    const objRepr = createJSObjRepr('obj');

    for (const property of node.properties) {
      if (property.type === 'ObjectProperty') {
        // @ts-ignore
        const resolved = resolve(property.value, scope);
        if (resolved) {
          if (resolved.type === 'descend'){
            resolved.onFinish = (resolvedResult) => {
              resolvedResult = resolvedResult
              .map((s: { pointsTo: any; }) => s.pointsTo ?? [s]).reduce((p: any, c: any) => [...p, ...c], [])[0];
              if (resolvedResult){
                if (property.key.type === 'Identifier') {
                  objRepr.kv[property.key.name] = resolvedResult;
                } else if (property.key.type === 'NumericLiteral') {
                  objRepr.kv[property.key.value] = resolvedResult;
                } else if (property.key.type === 'StringLiteral') {
                  objRepr.kv[property.key.value] = resolvedResult;
                }
                return true
              }else{
                return false
              }
            };
          } 
          else if (property.key.type === 'Identifier') {
            objRepr.kv[property.key.name] = resolved;
          } else if (property.key.type === 'NumericLiteral') {
            objRepr.kv[property.key.value] = resolved;
          } else if (property.key.type === 'StringLiteral') {
            objRepr.kv[property.key.value] = resolved;
          }
        }
      }
    }
    return objRepr;
  } else if(node.type === 'MemberExpression'){
    // const objRepr = createJSObjRepr('obj');
    return undefined;
  } else if (['FunctionExpression', 'ClassExpression', 'ArrowFunctionExpression'].includes(node.type)) {
    return {
      type: 'receipt',
      // @ts-ignore
      key: toENRELocKey(node.id?.loc ?? node.loc)
    };
  } else if (['StringLiteral', 'NumericLiteral', 'BooleanLiteral'].includes(node.type)) {
    return {
      // @ts-ignore
      type: {
        StringLiteral: 'string',
        NumericLiteral: 'number',
        BooleanLiteral: 'boolean',
      }[node.type],
      // @ts-ignore
      value: node.value,
    };
  } else if (node.type === 'CallExpression'){
    if (scope){
      return expressionHander(node, scope);
      //return task
    }
  }

  return undefined;
}

// Uses a cache to avoid duplicate object creation
const cachedRestObjs = new Map<JSObjRepr, Map<BindingPathRest, JSObjRepr>>();

export function getRest(objRepr: JSObjRepr, rest: BindingPathRest): JSObjRepr | undefined {
  if (!cachedRestObjs.has(objRepr)) {
    cachedRestObjs.set(objRepr, new Map());
  }

  // Get the previously created new rest JSObjRepr (if exist)
  let newRepr = cachedRestObjs.get(objRepr)!.get(rest);
  // kv still needs to be re-evaluated since parameter objRepr could have kv updated

  // Object rest
  if ('exclude' in rest) {
    if (!newRepr) {
      newRepr = createJSObjRepr('obj');
    }

    for (const [key, value] of Object.entries(objRepr.kv)) {
      if (!rest.exclude.includes(key)) {
        newRepr.kv[key] = value;
      }
    }
  }
  // Array rest
  else if ('start' in rest) {
    if (!newRepr) {
      newRepr = createJSObjRepr('array');
    }

    let newCounter = 0;

    if (objRepr.callable.iterator) {
      // @ts-ignore
      for (const [key, value] of Object.entries(objRepr.callable.iterator.pointsTo[0].callable[0].returns)) {
        // @ts-ignore
        if (parseInt(key) >= parseInt(rest.start)) {
          // @ts-ignore
          newRepr.kv[newCounter] = value.pointsTo[0];
          newCounter += 1;
        }
      }
    } else {
      for (const [key, value] of Object.entries(objRepr.kv)) {
        // @ts-ignore
        if (parseInt(key) >= parseInt(rest.start)) {
          newRepr.kv[newCounter] = value;
          newCounter += 1;
        }
      }
    }
  }

  if (newRepr && cachedRestObjs.get(objRepr)) {
    cachedRestObjs.get(objRepr)!.set(rest, newRepr);
  }

  return newRepr;
}
