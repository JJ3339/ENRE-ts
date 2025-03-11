export interface ENREEntityAbilityCallable {
  isAsync: boolean;
  isGenerator: boolean;
  returnType: any[]
}

export const addAbilityCallable = (
  isAsync: boolean,
  isGenerator: boolean,
  returnType: any[]
) => {
  return {
    isAsync,

    isGenerator,

    returnType
  };
};
