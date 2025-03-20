import {ENRETypeAbilityBase, addAbilityBaseType} from "./base-type"

export interface ENRETypeArray extends ENRETypeAbilityBase{
    elementTypeList: ENRETypeAbilityBase[];
    isArray: boolean;
    toString: () => string;
    updateElement: (elementType: ENRETypeAbilityBase) => void;
}

export const addAbilityArrayType = (
    element: ENRETypeAbilityBase[] | undefined
    // isPrimitive: boolean,
    // isReference: boolean
): ENRETypeArray => {
    return {
        ...addAbilityBaseType([]),
        elementTypeList: element === undefined ? [] : element,
        isArray: true,
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