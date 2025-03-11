import {ENRETypeAbilityBase, addAbilityBaseType} from "./base-type"

export interface ENRETypePrimitive extends ENRETypeAbilityBase{
    // typeName: any[];
    isPrimitive: boolean;
    toString: () => string;
}

export const addAbilityPrimitiveType = (
    typeName: any,
    // isPrimitive: boolean,
    // isReference: boolean
): ENRETypePrimitive => {
    return {
        ...addAbilityBaseType(typeName),
        isPrimitive: true,
        toString(): string {
            return `Primitive<${this.typeName}>`;
        }
        // isPrimitive,
        // isReference
    }
};