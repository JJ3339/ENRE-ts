import { ENRETypeAbilityBase, addAbilityBaseType } from "./base-type";

export interface ENRETypeObject extends ENRETypeAbilityBase {
  prop: Map<string, ENRETypeAbilityBase[]>;
  isReference: boolean;
  toString: () => string;
  updateProp: (object: { name: string, type: ENRETypeAbilityBase[] }) => void;
}

export const addAbilityObjectType = (
  typeName: any,
  properties?: Map<string, ENRETypeAbilityBase[]>
): ENRETypeObject => {
  // ✅ 防止 properties 未定义
  const propMap = properties ?? new Map<string, ENRETypeAbilityBase[]>();

  return {
    ...addAbilityBaseType(typeName),

    /**
     * ✅ 存储属性 (key => [TypeRecord])
     */
    prop: propMap,

    /**
     * ✅ 确认是引用类型
     */
    isReference: true,

    /**
     * ✅ 转换成字符串格式
     * { a: string; b: number[] }
     */
    toString(): string {
      return `{ ${[...this.prop.entries()]
        .map(([key, value]) =>
          `${key}: [${value.map(v => v.toString()).join(", ")}]`
        )
        .join("; ")} }`;
    },

    /**
     * ✅ 更新对象属性 (支持追加)
     */
    updateProp(object: { name: string; type: ENRETypeAbilityBase[] }): void {
      if (this.prop.has(object.name)) {
        // ✅ 如果已有属性，合并数组去重
        const existingTypes = this.prop.get(object.name)!;
        const newTypes = [...existingTypes, ...object.type];
        // const uniqueTypes = Array.from(new Set(newTypes.map(t => t.typeRepr)))
        //   .map(typeRepr => newTypes.find(t => t.typeRepr === typeRepr)!);

        // this.prop.set(object.name, uniqueTypes);
      } else {
        // ✅ 如果没有属性，直接添加
        this.prop.set(object.name, object.type);
      }
    }
  };
};
