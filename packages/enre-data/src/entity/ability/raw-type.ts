export interface ENREEntityAbilityRawType {
  typeID: number,
  typeRepr: string,//源码
  typeName: any[],//类型的fqn
}   
export const addAbilityRawType = (
  typeID: number,
  typeRepr: string,
  typeName: any[],
) => {
  return {
    typeID,

    typeRepr,

    typeName,
  };
};
