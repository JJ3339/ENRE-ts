import { ENRETypeAbilityBase, addAbilityBaseType } from "./base-type";

export interface ENRETypeObject extends ENRETypeAbilityBase {
  prop: Map<string, ENRETypeAbilityBase[]>; // 可以删去
  isObject: boolean;
  toString: () => string;
  updateProp: (object: { name: string, type: ENRETypeAbilityBase[] }) => void;
}

export const addAbilityObjectType = (
  statInferTypes: string[], //'object'，'class'
  properties?: Map<string, ENRETypeAbilityBase[]>
): ENRETypeObject => {
  // 防止 properties 未定义
  const propMap = properties ?? new Map<string, ENRETypeAbilityBase[]>();

  return {
    ...addAbilityBaseType(statInferTypes),

    //(key => [Type])
    prop: propMap,

    isObject: true,

    toString(): string {
      return `{ ${[...this.prop.entries()]
        .map(([key, value]) =>
          `${key}: [${value.map(v => v.toString()).join(", ")}]`
        )
        .join("; ")} }`;
    },
    // updateProp(object: { name: string; type: ENRETypeAbilityBase[] }): void {
    //   if (this.prop.has(object.name)) { 
    //     const existingTypes = this.prop.get(object.name)!;
    //     const newTypes = [...existingTypes, ...object.type];
    //     const uniqueTypes = Array.from(new Set(newTypes.map(t => t.toString())))
    //       .map(typeRepr => newTypes.find(t => t.toString() === typeRepr)!);

    //     this.prop.set(object.name, uniqueTypes);
    //   } else {
    //     this.prop.set(object.name, object.type);
    //   }
    // }
  };
};
