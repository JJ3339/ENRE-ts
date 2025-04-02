import {NodePath} from '@babel/traverse';
import {TSIndexSignature, TSTypeAnnotation} from '@babel/types';
import {ENREEntityCollectionAnyChildren, ENREEntityProperty, id, recordEntityProperty} from '@enre-ts/data';
import {toENRELocation} from '@enre-ts/location';
import {ENREContext} from '../context';
import ENREName from '@enre-ts/naming';
import {Type_is} from './common/binding-pattern-handler';
let property_ID=6;
type PathType = NodePath<TSIndexSignature>

export default (path: PathType, {scope}: ENREContext) => {
  let entity: ENREEntityProperty | undefined = undefined;
  let annotation;
  if ('typeAnnotation' in path.node) {
    annotation = (path.node.typeAnnotation as TSTypeAnnotation).typeAnnotation;
  }
  const types=Type_is(annotation,property_ID);
  if(types.type_id>=property_ID)property_ID+=1;
  const type = (path.node.parameters[0].typeAnnotation as TSTypeAnnotation).typeAnnotation.type;
  if (type === 'TSNumberKeyword') {
    entity = recordEntityProperty(
      new ENREName('Sig', 'NumberIndex'),
      toENRELocation(path.node.loc),
      scope.last(),
      {
        typeID: types.type_id,
        typeRepr: '',
        typeName: types.type_name,
      }
    );
  } else if (type === 'TSStringKeyword') {
    entity = recordEntityProperty(
      new ENREName('Sig', 'StringIndex'),
      toENRELocation(path.node.loc),
      scope.last(),
      {
        typeID: types.type_id,
        typeRepr: '',
        typeName: types.type_name,
      }
    );
  } else {
    // TODO: Warning
  }

  if (entity) {
    scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
  }
};
