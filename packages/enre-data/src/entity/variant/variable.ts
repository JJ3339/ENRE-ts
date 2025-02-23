import {ENRELocation} from '@enre-ts/location';
import ENREName from '@enre-ts/naming';
import {addAbilityBase, ENREEntityAbilityBase} from '../ability/base';
import {ENREEntityCollectionAll} from '../collections';
import {variableKind} from '@enre-ts/shared';
import {recordEntity} from '../../utils/wrapper';
// import { ENREEntityClass } from 'packages/enre-data/lib';
import {ENREEntityAbilityRawType,addAbilityRawType} from '../ability/raw-type';
import type { ENREEntityClass } from './class';
export interface ENREEntityVariable extends ENREEntityAbilityBase,ENREEntityAbilityRawType {
  type: 'variable';
  kind: variableKind;
  clsTypeName: string | undefined;
  instanceName: string | undefined;
}

export const createEntityVariable = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  {kind}: Pick<ENREEntityVariable, 'kind'>,
  {
    typeID=0,
    typeRepr='',
    typeName='',
  },
  typName: string|undefined,
  instanceName: string | undefined
): ENREEntityVariable => {
  return {
    ...addAbilityBase(name, location, parent),

    type: 'variable',

    kind,
    ...addAbilityRawType(typeID,typeRepr,typeName),
    clsTypeName: typName,

    instanceName: instanceName
  };
};

export const recordEntityVariable = recordEntity(createEntityVariable);
