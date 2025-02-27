import {ENRELocation} from '@enre-ts/location';
import ENREName from '@enre-ts/naming';
import {addAbilityBase, ENREEntityAbilityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {recordEntity} from '../../utils/wrapper';
import {ENREEntityAbilityRawType,addAbilityRawType} from '../ability/raw-type';
export interface ENREEntityParameter extends ENREEntityAbilityBase,ENREEntityAbilityRawType {
  type: 'parameter',
  path: any[],
  defaultAlter: any,
}

export const createEntityParameter = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  {
    typeID=0,
    typeRepr='',
    typeName=[''],
  },
  {path, defaultAlter}: Pick<ENREEntityParameter, 'path' | 'defaultAlter'>,
): ENREEntityParameter => {
  return {
    ...addAbilityBase(name, location, parent),

    type: 'parameter',

    path,
    ... addAbilityRawType(typeID,typeRepr,typeName),
    defaultAlter,
  };
};

export const recordEntityParameter = recordEntity(createEntityParameter);
