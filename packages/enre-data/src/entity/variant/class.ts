import {ENRELocation} from '@enre-ts/location';
import ENREName from '@enre-ts/naming';
import {addAbilityBase, ENREEntityAbilityBase} from '../ability/base';
import {ENREEntityAbilityRawType,addAbilityRawType} from '../ability/raw-type';
import {ENREEntityCollectionAll} from '../collections';
import {
  addAbilityAbstractable,
  ENREEntityAbilityAbstractable
} from '../ability/abstractable';
import {recordEntity} from '../../utils/wrapper';

export interface ENREEntityClass extends ENREEntityAbilityBase, ENREEntityAbilityAbstractable,ENREEntityAbilityRawType {
  type: 'class';
  // baseList放置待处理的类,在AST遍历时无法获取ENREEntityClass
  base?: string | ENREEntityClass
  // basecls放置已处理的类
  // basecls: Map<string, ENREEntityClass>;
  extcls: Map<string, ENREEntityClass>;
  // extcls: ENREEntityClass | undefined;
}

export const createEntityClass = (
  name: ENREName<any>,
  location: ENRELocation,
  parent: ENREEntityCollectionAll,
  {
    typeID=0,
    typeRepr='',
    typeName=[''],
  },
  {
    isAbstract = false,
  },
): ENREEntityClass => {
  return {
    ...addAbilityBase(name, location, parent),

    ...addAbilityAbstractable(isAbstract),
    ...addAbilityRawType(typeID, typeRepr, typeName),
    type: 'class',
    base: undefined,
    extcls: new Map()
  };
};

export const recordEntityClass = recordEntity(createEntityClass);
