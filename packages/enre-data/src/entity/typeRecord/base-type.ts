export interface ENRETypeAbilityBase{
    typeName: any
    // isPrimitive: boolean
    // isReference: boolean
 
}

export const addAbilityBaseType = (
    typeName: any,
    // isPrimitive: boolean,
    // isReference: boolean
): ENRETypeAbilityBase => {
    return {
        typeName,
        // isPrimitive,
        // isReference
    }
};
