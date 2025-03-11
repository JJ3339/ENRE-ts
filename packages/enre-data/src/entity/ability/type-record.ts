// export interface ENREEntityAbilityRawType {
//     typeID: number,
//     typeRepr: string,//源码
//     typeName: string[],//类型的fqn
//   }   
//   export const addAbilityRawType = (
//     typeID: number,
//     typeRepr: string,
//     typeName: string[],
//   ) => {
//     return {
//       typeID,
  
//       typeRepr,
  
//       typeName,
//     };
//   };
  
// export interface TypeRecord {
//     typeName: string;
//     // parent: TypeRecord | null;

//     // constructor(typeName: string, parent: TypeRecord | null = null) {
//     //     this.typeName = typeName;
//     //     this.parent = parent;
//     // }
//     // 实例方法
//     toString: () => string;

//     // 检查当前类型是否是某个父类型的子类型
//     // isSubclassOf(parentType: string): boolean {
//     //     let currentType: TypeRecord | null = this;
//     //     while (currentType) {
//     //         if (currentType.typeName === parentType) {
//     //             return true;
//     //         }
//     //         currentType = currentType.parent;  // 遍历父类
//     //     }
//     //     return false;
//     // }
// }
// // 原始类型子类
// export interface NumberType extends TypeRecord {
//     typeName: string = '';
//     constructor(){
//         this.typeName = 'Number'
//     }
//     toString(): {} {
//         throw new Error("Method not implemented.");
//     }
    
// }

// export class StringType implements TypeRecord {
//     constructor() {
//         super('string');  // "string" 类型
//     }
// }

// export class BooleanType implements TypeRecord {
//     constructor() {
//         super('boolean');  // "boolean" 类型
//     }
// }

// export class NullType implements TypeRecord {
//     constructor() {
//         super('null');  // "null" 类型
//     }
// }

// // 对象类型子类
// export class ObjectType implements TypeRecord {
//     properties: { [key: string]: TypeRecord };  // 存储对象的属性

//     constructor() {
//         super('object');  // "object" 类型
//         this.properties = {};  // 初始化对象属性
//     }

//     addProperty(name: string, type: TypeRecord): void {
//         this.properties[name] = type;
//     }
// }

// export class ArrayType implements TypeRecord {
//     elementType: TypeRecord | null;  // 存储数组元素的类型

//     constructor() {
//         super('Array', new TypeRecord('object'));  // "Array" 继承自 "object"
//         this.elementType = null;  // 默认无元素类型
//     }

//     setElementType(type: TypeRecord): void {
//         this.elementType = type;
//     }
// }

// export class FunctionType implements TypeRecord{
//     // constructor(){
//     // }
// }

// export class AnyType implements TypeRecord{
//     static AnyNodes = []
//     // constructor(){
//     // }
// }