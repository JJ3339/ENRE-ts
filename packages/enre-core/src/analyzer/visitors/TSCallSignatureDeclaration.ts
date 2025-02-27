import {NodePath} from '@babel/traverse';
import {TSCallSignatureDeclaration, TSTypeAnnotation} from '@babel/types';
import {ENREEntityCollectionAnyChildren, recordEntityProperty} from '@enre-ts/data';
import {toENRELocation} from '@enre-ts/location';
import ENREName from '@enre-ts/naming';
import {ENREContext} from '../context';
import {Type_is} from './VariableDeclarator';
let property_ID=6;
type PathType = NodePath<TSCallSignatureDeclaration>

export default (path: PathType, {scope}: ENREContext) => {
  let annotation;
  if ('typeAnnotation' in path.node) {
    annotation = (path.node.typeAnnotation as TSTypeAnnotation).typeAnnotation;
  }
  const types=Type_is(annotation,property_ID);
  if(types.type_id>=property_ID)property_ID+=1;

  const entity = recordEntityProperty(
    new ENREName<'Sig'>('Sig', 'Callable'),
    toENRELocation(path.node.loc),
    scope.last(),
    {
      typeID: types.type_id,
      typeRepr: '',
      typeName: types.type_name,
    }
  );

  scope.last<ENREEntityCollectionAnyChildren>().children.push(entity);
};

