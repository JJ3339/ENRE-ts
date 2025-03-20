export interface ENRETypeAbilityBase{
    statInferTypes: any[], // 普通变量的自身类型/函数的返回值类型
    resType: any,
    LLMInferTypes: any[],
   
    
}

export const addAbilityBaseType = (
    statInferTypes: any[]
): ENRETypeAbilityBase => {
    return {
        statInferTypes: statInferTypes,
        resType: undefined,
        LLMInferTypes: []
    }
};
