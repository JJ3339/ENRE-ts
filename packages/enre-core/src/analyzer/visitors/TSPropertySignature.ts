/**
 * TSPropertySignature
 *
 * Extracted entities:
 *   * Property
 */

import {NodePath} from '@babel/traverse';
import {TSPropertySignature,TSTypeAnnotation} from '@babel/types';
import {ENREEntityCollectionAnyChildren, ENREEntityProperty, id, recordEntityProperty} from '@enre-ts/data';
import {toENRELocation} from '@enre-ts/location';
import ENREName from '@enre-ts/naming';
import {ENREContext} from '../context';
import {Type_is} from './VariableDeclarator';
let property_ID=6;
type PathType = NodePath<TSPropertySignature>

export default (path: PathType, {scope}: ENREContext) => {
  let entity: ENREEntityProperty | undefined = undefined;

  let annotation;
  if ('typeAnnotation' in path.node) {
    annotation = (path.node.typeAnnotation as TSTypeAnnotation).typeAnnotation;
  }
  const types=Type_is(annotation,property_ID);
  if(types.type_id>=property_ID)property_ID+=1;

  switch (path.node.key.type) {
    case 'Identifier':
      entity = recordEntityProperty(
        new ENREName('Norm', path.node.key.name),
        toENRELocation(path.node.key.loc),
        scope.last(),
        {
          typeID: types.type_id,
          typeRepr: '',
          typeName: types.type_name,
        }
      );
      break;

    // TODO: If a string literal has the same content as a numeric literal, an warning should raise
    case 'StringLiteral':
      entity = recordEntityProperty(
        new ENREName('Str', path.node.key.value),
        toENRELocation(path.node.key.loc),
        scope.last(),
        {
          typeID: types.type_id,
          typeRepr: '',
          typeName: types.type_name,
        }
      );
      break;

    case 'NumericLiteral':
      entity = recordEntityProperty(
        new ENREName('Num', path.node.key.extra?.raw as string, path.node.key.value),
        toENRELocation(path.node.key.loc),
        scope.last(),
        {
          typeID: types.type_id,
          typeRepr: '',
          typeName: types.type_name,
        }
      );
      break;

    default:
    // WONT-FIX: Extract name from other expressions
  }

  if (entity) {
    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
  }
};
