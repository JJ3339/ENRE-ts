import {ENRETypeAbilityBase, addAbilityBaseType} from "./base-type"

export interface ENRETypePrimitive extends ENRETypeAbilityBase{

    isPrimitive: boolean;
    toString: () => string;
}

export const addAbilityPrimitiveType = (
    statInferTypes: any[],
): ENRETypePrimitive => {
    return {
        ...addAbilityBaseType(statInferTypes),
        isPrimitive: true,
        toString(): string {
            return `Primitive<${this.resType}>`;
        }
    }
};