
export interface ENREEntityAbilityRawType {
  typeID: number,
  typeRepr: string,//源码
  typeName: string[],//类型的fqn
}   
export const addAbilityRawType = (
  typeID: number,
  typeRepr: string,
  typeName: string[],
) => {
  return {
    typeID,

    typeRepr,

    typeName,
  };
};
