/**
 * ReturnStatement|YieldStatement
 */

import {ENREContext} from '../context';
import {NodePath} from '@babel/traverse';
import {ReturnStatement} from '@babel/types';
import expressionHandler from './common/expression-handler';
import { ENREEntityCollectionAll, ENREEntityCollectionCallable } from '@enre-ts/data';
import { literalTypes } from '@enre-ts/data';
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
  let task = undefined;
  let subtask = undefined;
  if (path.node.argument.type === 'ConditionalExpression'){
    task = expressionHandler(path.node.argument.alternate, scope);
    subtask = expressionHandler(path.node.argument.consequent, scope);
  }else{
    task = expressionHandler(path.node.argument, scope);
  }
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
      // 修改字面量类型在pointsTo中的存储，并将类型推导后面的操作中
      symbolSnapshot.forEach((element: { typeName: any[]; }) => {
        if (element.typeName){
          element.typeName.forEach((t: string) => {
            if(literalTypes.includes(t) && !(callableEntity as ENREEntityCollectionCallable).returnType.includes(t)){
              (callableEntity as ENREEntityCollectionCallable).returnType.push(t);
            }
          });
        }
      });
      // If symbolSnapshot is an entity type, convert it to an obj type.
      // 在task中，若只有一个access，则不会将其转换为obj, 见index437:443
      
      // 处理数据结构，可能会增加s.type判断类型
      symbolSnapshot = symbolSnapshot
        .map((s: { pointsTo: any; type: string }) => 
          s.type === 'variable' ? [s] : s.pointsTo ?? [s]
        )
        .reduce((p: any, c: any) => [...p, ...c], []);

      // symbolSnapshot = symbolSnapshot.map((s: { pointsTo: any; }) => s.pointsTo ?? [s]).reduce((p: any, c: any) => [...p, ...c], []);
      
      if ('pointsTo' in callableEntity) {
        // 避免因symbolSnapshot为空时导致的传播失败（因为return true）
        if (symbolSnapshot.length === 0){
          return false;
        }
        
        symbolSnapshot.forEach((s: { callable: any[]; }) => {
          if (s.callable) {
            s.callable.forEach(c => {
              // c.returns - ENREEntity as symbol
              if(mode === GETENTITY){
                //TODO: c.entity? c.return
                if (c.entity.kind == 'constructor'){
                  if (c.returns.length === 0){   
                    return false;
                  }
                  callableEntity.pointsTo[0].callable[0].returns.push(c.returns[0]);
                }
                else{
                  callableEntity.pointsTo[0].callable[0].returns.push(c.entity);
                }
                //callableEntity.pointsTo[0].callable[0].returns.push(c.entity);
                
              }else{
                //GETRETURN 
                c.returns.forEach((r: any) => {
                callableEntity.pointsTo[0].callable[0].returns.push(r);
              });
              }
              callableEntity.pointsTo[0].callable[0].returns.forEach((r: { typeName: any; returnType: any; }) =>{
                  if (r.typeName){
                    (callableEntity as ENREEntityCollectionCallable)?.returnType.push(...r.typeName)
                  }else if (r.returnType){
                    (callableEntity as ENREEntityCollectionCallable)?.returnType.push(...r.returnType)
                  }
              })

              // ENREEntity as symbol
            });
          } else{
            callableEntity.pointsTo[0].callable[0].returns.push(s);
          }
        });
        // callableEntity.pointsTo[0].callable[0].returns.push(...symbolSnapshot);
        return true;
      }
      // TODO
      return false;
    };
  }
  if (subtask){
    subtask.onFinish = task?.onFinish;    
  }
};
