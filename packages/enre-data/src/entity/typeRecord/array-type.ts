import {ENRETypeAbilityBase, addAbilityBaseType} from "./base-type"

export interface ENRETypePrimitive extends ENRETypeAbilityBase{
    elementTypeList: ENRETypeAbilityBase[];
    isReference: boolean;
    toString: () => string;
    updateElement: (elementType: ENRETypeAbilityBase) => void;
}

export const addAbilityArrayType = (
    typeName: any,
    element: ENRETypeAbilityBase[] | undefined
    // isPrimitive: boolean,
    // isReference: boolean
): ENRETypePrimitive => {
    return {
        ...addAbilityBaseType(typeName),
        elementTypeList: element === undefined ? [] : element,
        isReference: true,
        toString(): string {
            return `Array<${this.elementTypeList.toString()}>`;
            // const typeNames = this.elementTypeList.map(t => t.toString()).join(" | ");
            // return `Array<${typeNames}>`;
        },
        updateElement(elementType): void{
            if (!this.elementTypeList.some(e => e.toString() === elementType.toString())) {
                this.elementTypeList.push(elementType);
              }
        }
    }
};