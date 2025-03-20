import { ENRETypeAbilityBase, addAbilityBaseType } from "./base-type";

export interface ENRETypeFunction extends ENRETypeAbilityBase {
  
  isFunc: boolean;
  isAnonFunc: boolean;
  isArrowFunc: boolean;
  params: ENRETypeAbilityBase[] // 参数类型的引用
  return: ENRETypeAbilityBase[] // 返回类型的引用
  toString: () => string;
  
}

export const addAbilityObjectType = (
  statInferTypes: string[], //
  isAnonFunc: boolean,
  isArrowFunc: boolean
): ENRETypeFunction => {
  

  return {
    ...addAbilityBaseType(statInferTypes),

    isFunc: true,
    isAnonFunc: isAnonFunc,
    isArrowFunc: isArrowFunc,

    params: [],
    return: [],
    toString(): string {
        const paramsStr = this.params
            .map((param) => param.toString()) // 检查`param.toString()` 
            .join(", ");
        
        
        const returnStr = this.return
            .map((ret) => ret.toString()) //  检查`ret.toString()` 
            .join(", ");
        
        return `(${paramsStr}) => ${returnStr}`;  
    }
  };
};
