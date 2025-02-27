import {ENRELocation} from '@enre-ts/location';
import ENREName from '@enre-ts/naming';
import {addAbilityBase, ENREEntityAbilityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {recordEntity} from '../../utils/wrapper';
import {ENREEntityAbilityRawType,addAbilityRawType} from '../ability/raw-type';
export interface ENREEntityProperty extends ENREEntityAbilityBase,ENREEntityAbilityRawType {
  type: 'property';
  // signature: 'property' | 'call' | 'constructor' | 'method';
}

export const createEntityProperty = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  {
    typeID=0,
    typeName=[''],
    typeRepr='',
  }
  // {
  //   signature = 'property',
  // }: Partial<Pick<ENREEntityProperty, 'signature'>>
): ENREEntityProperty => {
  return {
    ...addAbilityBase(name, location, parent),

    get type() {
      return 'property' as const;
    },
    ...addAbilityRawType(typeID,typeRepr,typeName),//property 也是variable

    // get signature() {
    //   return signature;
    // },
  };
};

export const recordEntityProperty = recordEntity(createEntityProperty);
