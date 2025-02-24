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
const GETENTITY = 1;
const GETRETURN = 0;
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
  let mode = GETRETURN;
  switch (path.node.argument.type){
    case 'Identifier':{
      mode = GETENTITY;
      break;
    }
    case 'ArrowFunctionExpression':{
      mode = GETENTITY;
      break;
    }
    case 'MemberExpression':{
      mode = GETENTITY;
      break;
    }
  }
  if (task) {
    task.onFinish = (symbolSnapshot) => {
      // if ('pointsTo' in symbolSnapshot){
      //   if(symbolSnapshot.length !==1){
      //     console.log('ERROR A')
      //   }
      //   symbolSnapshot = symbolSnapshot[0].pointsTo
      // }
      /**
       * The return statement is strictly bind to its declaration function body,
       * thus will always be the first callable of the first pointsTo item
       * in the callable array.
       */
      if (!symbolSnapshot){
        return false;
      }
      // If symbolSnapshot is an entity type, convert it to an obj type.
      // 在task中，若只有一个access，则不会将其转换为obj, 见index437:443
      symbolSnapshot = symbolSnapshot.map((s: { pointsTo: any; }) => s.pointsTo ?? [s]).reduce((p: any, c: any) => [...p, ...c], []);
      
      if ('pointsTo' in callableEntity) {
        // 避免因symbolSnapshot为空时导致的传播失败（因为return true）
        if (symbolSnapshot.length === 0){
          return false;
        }
        
        symbolSnapshot.forEach((s: { callable: any[]; }) => {
          s.callable.forEach(c => {
            // c.returns - ENREEntity as symbol
            if(mode === GETENTITY){
              
              callableEntity.pointsTo[0].callable[0].returns.push(c.entity);
              
            }else{
              //GETRETURN 
              c.returns.forEach((r: any) => {
              callableEntity.pointsTo[0].callable[0].returns.push(r);
            });
            }
            
            // ENREEntity as symbol
          });
        });
        // callableEntity.pointsTo[0].callable[0].returns.push(...symbolSnapshot);
        return true;
      }
      // TODO
      return false;
    };
  }
};
