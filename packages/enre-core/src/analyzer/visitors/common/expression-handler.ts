/**
 * (Handler for all) ExpressionStatement
 *
 * This hook does not extract any entity/relation,
 * but only convert AST to token stream (IR) for later use.
 *
 * Extracted entities:
 *   * N/A
 *
 * Extracted relations:
 *   * N/A
 */

import {
  ArgumentPlaceholder,
  ArrowFunctionExpression,
  ClassPrivateProperty,
  ClassProperty,
  Expression,
  FunctionExpression,
  JSXNamespacedName,
  LVal,
  PrivateName,
  SpreadElement,
  ThrowStatement
} from '@babel/types';
import {ENREEntityCollectionAll, ENREEntityCollectionScoping, postponedTask, recordRelationCall, recordEntityFunction} from '@enre-ts/data';
import {ENRELocation, toENRELocation, ToENRELocationPolicy} from '@enre-ts/location';
import {ENREContext} from '../../context';
import resolveJSObj, {createJSObjRepr, JSObjRepr} from './literal-handler';
import { ClassHierarchyAnalyzer as CHAnalyzer } from '../../callgraph/ClassHierarchyAnalysisAlgorithm';
import { RapidTypeAnalyzer as RTAnalyzer } from '../../callgraph/RapidTypeAnalysisAlgorithm';
import { PointerAnalyzer as PTAnalyzer } from '../../callgraph/PointerAnalysis';
import exp from 'constants';
import lookup from '../../linker/lookup';
import ENREName from '@enre-ts/naming';
/**
 * Types
 */

// An ascend task object, containing information for resolving a VariableDeclaration.
export type AscendPostponedTask = {
  type: 'ascend',
  payload: any,
  scope: ENREEntityCollectionScoping,
  onFinish?: (symbolSnapshot: any) => boolean,
}

// A descend task object, containing necessary information for resolving an expression.
export type DescendPostponedTask = {
  type: 'descend',
  payload: TokenStream,
  scope: ENREEntityCollectionScoping,
  onFinish?: (symbolSnapshot: any, idx?: number) => boolean,
  onFinishEntity?: (symbolSnapshot: any) => boolean,
}

/**
 * Token stream that is translated from the given expression AST node.
 * Tokens are in reverse order.
 */
type TokenStream = ExpressionToken[];

type ExpressionToken =
  CallToken
  | NewToken
  | AccessToken
  | AssignToken;

/**
 * There should be a token type 'copy' responding for JS import/export alias
 * that propagate non-alias entity's all belonging pointsTo to all its alias. (Note that
 * the alias chain may not be only one edge, but many)
 *
 * However, this may be memory consuming (given the same set of pointsTo is stored in all
 * alias entities and the raw entity), currently the alias handling is in the function
 * `lookup` if the second argument is true (omitAlias), which given an alias name, the
 * function will go through the alias chain until the raw entity is met.
 */

/**
 * A token is basically a (simplified) three-address code.
 * See comments for full view of token's shape and field declarations.
 */
interface BaseToken {
  /**
   * The operation of the token.
   */
  // operation: string as const,

  /**
   * The first operand of the token.
   * In three-address code system, this is what the operation manipulate on.
   * In ENRE, this always refers to the result of a previous token, thus it is never set
   * in the token stream.
   *
   * (SUBJECT TO DESIGN CHANGE)
   */
  // operand0: undefined,

  /**
   * The second operand of the token.
   * The meaning of this operand varies with the operation.
   * See each token below for specific meaning.
   */
  // operand1: any,

  location: ENRELocation,
}

interface CallableBaseToken extends BaseToken {
  // Arguments, in the raw present order
  operand1: JSObjRepr,
}

interface CallToken extends BaseToken, CallableBaseToken {
  operation: 'call',
}

interface NewToken extends BaseToken, CallableBaseToken {
  operation: 'new',
}

interface AccessToken extends BaseToken {
  operation: 'access',
  // Force override currSymbol
  operand0?: any,
  // Not exist if operand0 exist
  operand1: string | symbol,

  computed?: boolean
}

/**
 * This only refers to the assignment operation in an expression, not the variable
 * declaration and instant initialization, though they have both the same operation name.
 */
interface AssignToken extends BaseToken {
  operation: 'assign',
  // Can only be an access token
  operand0: AccessToken,
  operand1: any,
}

interface PassToken {
  operation: 'pass',
  operand0: any,
}


/**
 * Implementations
 */

interface CustomHandlers {
  onFinish?: DescendPostponedTask['onFinish'],
  onFinishEntity?: DescendPostponedTask['onFinishEntity'],
}

type ResolvableNodeTypes =
  Expression
  | SpreadElement
  | JSXNamespacedName
  | ArgumentPlaceholder
  | LVal
  | ThrowStatement
  | PrivateName
  | ClassProperty
  | ClassPrivateProperty;

export default function resolve(
  node: ResolvableNodeTypes,
  scope: ENREContext['scope'],
  handlers?: CustomHandlers,
) {
  try {
    const tokens = recursiveTraverse(node, scope, handlers);

    if (tokens.length === 0) {
      return undefined;
    }

    // The resolve of token stream is postponed to the linker.
    const task: DescendPostponedTask = {
      type: 'descend',
      payload: tokens,
      scope: scope.last(),
      onFinish: handlers?.onFinish,
      onFinishEntity: handlers?.onFinishEntity,
    };
    postponedTask.add(task);

    return task;
  } catch (e) {
    // Failed to create IR
  }
}

/**
 * Traverse the AST node recursively, generate a token stream, but not create
 * corresponding postponedTask, just return it for callee to merge.
 */
function recursiveTraverse(
  node: ResolvableNodeTypes,
  scope: ENREContext['scope'],
  handlers?: CustomHandlers
): TokenStream {
  const tokenStream: TokenStream = [];

  // TODO: Handle points-to propagation by try-catch
  switch (node.type) {
    case 'AssignmentExpression': {
      const leftTask = resolve(node.left, scope, handlers)!;

      if (['FunctionExpression', 'ArrowFunctionExpression', 'ClassExpression'].includes(node.right.type)) {
        // This should give us a receipt for the literal, which will be used for retrieve the entity
        const objRepr = resolveJSObj(node.right);
        if (objRepr !== undefined) {
          const assignmentTarget = leftTask.payload.shift();

          if (leftTask) {
            leftTask.onFinish = (symbolSnapshot, idx) => {
              postponedTask.add({
                type: 'descend',
                payload: [
                  {
                    operation: 'assign',
                    operand0: assignmentTarget,
                    operand1: [objRepr],
                  },
                  {
                    operation: 'access',
                    operand0: symbolSnapshot,
                  }
                ],
                scope: scope.last(),
                onFinish: undefined,
              } as DescendPostponedTask, idx);

              return true;
            };
          }
        }
      } else {
        const rightTask = resolve(node.right, scope, handlers);

        /**
         * Pick the last token of the left task and form a new task for the assignment
         * operation, so that linker knows to create a new property if the expression tries
         * to assign to a non-existing property.
         */
        const assignmentTarget = leftTask?.payload.shift();

        if (rightTask && assignmentTarget) {

          rightTask.onFinish = (symbolSnapshotRight: any) => {
            if(symbolSnapshotRight.length===0) {return false;}
            leftTask.onFinish = (symbolSnapshotLeft: any, idx?: number) => {
              postponedTask.add({
                type: 'descend',
                payload: [
                  {
                    operation: 'assign',
                    operand0: assignmentTarget,
                    operand1: symbolSnapshotRight,
                  },
                  {
                    operation: 'access',
                    operand0: symbolSnapshotLeft,
                  }
                ],
                scope: scope.last(),
                onFinish: undefined,
              } as DescendPostponedTask, idx);

              return true;
            };

            return true;
          };
        }
      }
      break;
    }
    case "ConditionalExpression" :{
      // let atlerTask = recursiveTraverse(node.alternate as Expression, scope, handlers);
      // let conseqTask = recursiveTraverse(node.consequent as Expression, scope, handlers);
      break;
    }
    //取消该分析，classProperty分析参考对应的节点分析
    // case 'ClassProperty': {
    //   // if the key is not identifier, it may result in error
    //   if (!node.value){
    //     break;
    //   }
    //   const leftTask = resolve(node.key, scope, handlers)!;

    //   if (['FunctionExpression', 'ArrowFunctionExpression', 'ClassExpression'].includes(node.value.type)) {
    //     // This should give us a receipt for the literal, which will be used for retrieve the entity
    //     const objRepr = resolveJSObj(node.value);
    //     if (objRepr !== undefined) {
    //       const assignmentTarget = leftTask.payload.shift();

    //       if (leftTask) {
    //         leftTask.onFinish = (symbolSnapshot) => {
    //           postponedTask.add({
    //             type: 'descend',
    //             payload: [
    //               {
    //                 operation: 'assign',
    //                 operand0: assignmentTarget,
    //                 operand1: [objRepr],
    //               },
    //               {
    //                 operation: 'access',
    //                 operand0: symbolSnapshot,
    //               }
    //             ],
    //             scope: scope.last(),
    //             onFinish: undefined,
    //           } as DescendPostponedTask);

    //           return true;
    //         };
    //       }
    //     }
    //   } else {
    //     const rightTask = resolve(node.value, scope, handlers);

    //     /**
    //      * Pick the last token of the left task and form a new task for the assignment
    //      * operation, so that linker knows to create a new property if the expression tries
    //      * to assign to a non-existing property.
    //      */
    //     const assignmentTarget = leftTask?.payload.shift();

    //     if (rightTask && assignmentTarget) {
    //       rightTask.onFinish = (symbolSnapshotRight: any) => {
    //         leftTask.onFinish = (symbolSnapshotLeft: any) => {
    //           postponedTask.add({
    //             type: 'descend',
    //             payload: [
    //               {
    //                 operation: 'assign',
    //                 operand0: assignmentTarget,
    //                 operand1: symbolSnapshotRight,
    //               },
    //               {
    //                 operation: 'access',
    //                 operand0: symbolSnapshotLeft,
    //               }
    //             ],
    //             scope: scope.last(),
    //             onFinish: undefined,
    //           } as DescendPostponedTask);

    //           return true;
    //         };

    //         return true;
    //       };
    //     }
    //   }
    //   break;
    // }
    case 'OptionalCallExpression':
    case 'NewExpression':
    case 'CallExpression' : {
      let operation: 'call' | 'new' = 'call';
      if (node.type === 'NewExpression') {
        operation = 'new';
      }
      const calleeTokens = recursiveTraverse(node.callee as Expression, scope, handlers);
      if (['FunctionExpression', 'ArrowFunctionExpression'].includes(node.callee.type)){
        if (node.callee.type === 'FunctionExpression'){
          if (node.callee.id){
            // const calleeTokens = recursiveTraverse(node.callee.id, scope, handlers);
            calleeTokens.push(
              ...recursiveTraverse(node.callee.id, scope, handlers)
            );
          }else{
            calleeTokens.push({
              operation: 'access',
              operand1: '<Anon Function>',
              location: toENRELocation(node.callee.loc)
            });
          }
        }else{
          calleeTokens.push({
            operation: 'access',
            operand1: '<Arrow Function>',
            location: toENRELocation(node.callee.loc)
          });
        }
      }
      // @ts-ignore TODO: callee can be V8IntrinsicIdentifier
      //const calleeTokens = recursiveTraverse(node.callee, scope, handlers);
      // if (['FunctionExpression', 'ArrowFunctionExpression'].includes(node.callee.type)){
      //   if (node.callee)
      // }
      /**
       * Resolve arguments of the call expression.
       * The shape of argsRepr is still a JSObjRepr (for uniformed handling).
       */
      const argsRepr = createJSObjRepr('array');

      for (const [index, arg] of Object.entries(node.arguments)) {
        // @ts-ignore
        const objRepr = resolveJSObj(arg);
        if (objRepr !== undefined) {
          argsRepr.kv[index] = objRepr;
          continue;
        }

        const argTask = resolve(arg, scope);
        if (argTask) {
          argTask.onFinish = (symbolSnapshot) => {
            if (!symbolSnapshot || symbolSnapshot.length === 0){
              return false;
            }
            argsRepr.kv[index] = symbolSnapshot;
            // FIXME: the return value needs to be refacted
            return true;
          };
        }
      }
      CHAnalyzer.addExpr(scope.last(), node)
      if (operation === 'new'){
        const newExpr = lookup(
        {role: 'value',
          identifier: calleeTokens[0].operand1,
          at: scope.last(),
        }, true) as ENREEntityCollectionScoping;
        if (newExpr){
          RTAnalyzer.newClass.push(newExpr)
        }
      }
      tokenStream.push({
        operation,
        operand1: argsRepr,
        location: toENRELocation(node.callee.loc, ToENRELocationPolicy.PartialEnd),
      }, ...calleeTokens);
     break;
    }

    case 'OptionalMemberExpression':
    case 'MemberExpression': {
      const objectTokens = recursiveTraverse(node.object, scope, handlers);

      const prop = node.property;

      let propName: string | symbol | undefined = undefined;
      if (prop.type === 'Identifier') {
        propName = prop.name;
      } else if (prop.type === 'StringLiteral') {
        propName = prop.value;
      } else if (prop.type === 'NumericLiteral') {
        propName = prop.value.toString();
      } else if (prop.type === 'MemberExpression') {
        // Detect `Symbol.iterator` and `Symbol.asyncIterator`
        // In this hard-coded case, using a variable that points to `Symbol` is not supported.
        if (prop.object.type === 'Identifier'
          && prop.object.name === 'Symbol'
          && prop.property.type === 'Identifier'
          && ['iterator', 'asyncIterator'].includes(prop.property.name)
        ) {
          if (prop.property.name === 'iterator') {
            propName = Symbol.iterator;
          } else if (prop.property.name === 'asyncIterator') {
            propName = Symbol.asyncIterator;
          }
        }
      }

      if (propName) {
        tokenStream.push({
          operation: 'access',
          operand1: propName,
          location: toENRELocation(node.property.loc),
          computed: node.computed
        }, ...objectTokens);
      } else {
        const propTask = resolve(node.property, scope, undefined);

        if (propTask) {
          propTask.onFinish = (symbolSnapshot) => {
            symbolSnapshot.forEach((s: any) => {
              postponedTask.add({
                type: 'descend',
                payload: [
                  {
                    operation: 'access',
                    operand1: s,
                    location: toENRELocation(node.property.loc),
                  },
                  ...objectTokens,
                ],
                scope: scope.last(),
                onFinish: undefined,
              } as DescendPostponedTask);
            });

            return true;
          };
        }
      }
      break;
    }
    // case 'FunctionExpression':{
    //   // while(node.body.type === 'BlockStatement'){
    //   //let idTokens = undefined
    //   if (node.id){
    //     tokenStream.push(...recursiveTraverse(node.id, scope, handlers));
    //   }else{
    //     tokenStream.push({
    //       operation: 'access',
    //       operand1: '<Anon Function>',
    //       location: toENRELocation(node.loc)
    //     });
    //     // const entity = recordEntityFunction(
    //     //   new ENREName<'Anon'>('Anon', 'Function'),
    //     //   toENRELocation(node.loc),
    //     //   scope.last(),
    //     //   {
    //     //     isArrowFunction: true,
    //     //     isAsync: node.async,
    //     //     isGenerator: node.generator,
    //     //   }
    //     // );
    //     // recordRelationCall(
    //     //   scope.last(),
    //     //   entity,
    //     //   entity.location,
    //     //   {isNew: false},
    //     // ).isImplicit = true;
    //     // let from =
    //     // let to = created.to.getQualifiedName()
    //     //                     if (!PTAnalyzer.callGraph.has(from)) {
    //     //                       PTAnalyzer.callGraph.set(from, new Set());
    //     //                     }
    //     //                     PTAnalyzer.callGraph.get(from)?.add(to);
    //   // }
    //   }
    //   //const objRepr = resolveJSObj(node);
    //   // tokenStream.push({
    //   //    operation
    //   // });
    //   //const tokens = recursiveTraverse(node.body, scope, handlers);
    //   break;
    // }
    case 'ArrowFunctionExpression':{
      tokenStream.push({
        operation: 'access',
        operand1: '<Arrow Function>',
        location: toENRELocation(node.loc)
      });
      // const entity = recordEntityFunction(
      //   new ENREName<'Anon'>('Anon', 'ArrowFunction'),
      //   toENRELocation(node.loc),
      //   scope.last(),
      //   {
      //     isArrowFunction: true,
      //     isAsync: node.async,
      //     isGenerator: node.generator,
      //   }
      // );
      // recordRelationCall(
      //   scope.last(),
      //   entity,
      //   entity.location,
      //   {isNew: false},
      // ).isImplicit = true;
      break;
    }
    case 'Identifier': {
      tokenStream.push({
        operation: 'access',
        operand1: node.name,
        location: toENRELocation(node.loc)
      });
      break;
    }

    case 'ThisExpression': {
      tokenStream.push({
        operation: 'access',
        operand1: 'this',
        location: toENRELocation(node.loc),
      });
      break;
    }

    case 'Super': {
      tokenStream.push({
        operation: 'access',
        operand1: 'super',
        location: toENRELocation(node.loc)
      });
      break;
    }

    case 'NumericLiteral': {
      tokenStream.push({
        operation: 'access',
        operand1: node.value.toString(),
        location: toENRELocation(node.loc),
      });
      break;
    }

    case 'StringLiteral': {
      tokenStream.push({
        operation: 'access',
        operand1: node.value,
        location: toENRELocation(node.loc),
      });
      break;
    }
  }

  return tokenStream;
}
