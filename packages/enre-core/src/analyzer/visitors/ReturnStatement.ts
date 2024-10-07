/**
 * ReturnStatement|YieldStatement
 */

import {ENREContext} from '../context';
import {NodePath} from '@babel/traverse';
import {ReturnStatement} from '@babel/types';
import expressionHandler from './common/expression-handler';

type PathType = NodePath<ReturnStatement>
//TODO: extend the set to analyse more types in arkts(hjj)
const validTypes = ['function', 'method']; // 这里可以添加更多类型
export default (path: PathType, {file: {logs}, scope}: ENREContext) => {
  const callableEntity = scope.last();

  // if (callableEntity.type !== 'function' ) {
  //   return;
  // }
  if (!validTypes.includes(callableEntity.type)) {
    return;
  }
  if (!path.node.argument) {
    return;
  }

  const task = expressionHandler(path.node.argument, scope);
  if (task) {
    task.onFinish = (symbolSnapshot) => {
      /**
       * The return statement is strictly bind to its declaration function body,
       * thus will always be the first callable of the first pointsTo item
       * in the callable array.
       */
      if ('pointsTo' in callableEntity) {
        callableEntity.pointsTo[0].callable[0].returns.push(...symbolSnapshot);
        return true;
      }
      // TODO
      return true;
    };
  }
};
