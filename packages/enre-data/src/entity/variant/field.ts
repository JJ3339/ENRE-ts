import {ENRELocation} from '@enre-ts/location';
import ENREName from '@enre-ts/naming';
import {addAbilityBase, ENREEntityAbilityBase} from '../ability/base';
import {
  addAbilityClassMember,
  ENREEntityAbilityClassMember
} from '../ability/class-member';
import {ENREEntityClass} from './class';
import {
  addAbilityAbstractable,
  ENREEntityAbilityAbstractable
} from '../ability/abstractable';
import {recordEntity} from '../../utils/wrapper';
import {ENREEntityAbilityRawType,addAbilityRawType} from '../ability/raw-type';
export interface ENREEntityField extends ENREEntityAbilityBase, ENREEntityAbilityClassMember, ENREEntityAbilityRawType, ENREEntityAbilityAbstractable {
  type: 'field';
}

export const createEntityField = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: ENREEntityClass,
  {
    isStatic = false,
    isPrivate = false,
    isAbstract = false,
    TSVisibility = undefined,
    typeID=0,
    typeRepr='',
    typeName=[''],
  }: Partial<Pick<ENREEntityField, 'isStatic' | 'isPrivate' | 'isAbstract' | 'TSVisibility'|'typeID'|'typeRepr'|'typeName'>>
): ENREEntityField => {
  return {
    ...addAbilityBase(name, location, parent),

    ...addAbilityClassMember(isStatic!, isPrivate!, TSVisibility),

    ...addAbilityAbstractable(isAbstract!),

    ...addAbilityRawType(typeID,typeRepr,typeName),

    type: 'field',
  };
};

export const recordEntityField = recordEntity(createEntityField);
