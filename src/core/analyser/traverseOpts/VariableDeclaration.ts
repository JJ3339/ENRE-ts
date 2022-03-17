/**
 * VariableDeclaration
 *
 * Extractable entity:
 *   * Variable
 */

import {NodePath} from '@babel/traverse';
import {Identifier, PatternLike, RestElement, VariableDeclaration} from '@babel/types';
import {verbose} from '../../utils/cliRender';
import {ENREEntityCollectionScoping, ENRELocation} from '../entities';
import {ENREEntityVariable, recordEntityVariable, variableKind} from '../entities/eVariable';
import {toENRELocation} from '../../utils/locationHelper';

const handleBindingPatternRecursively = (
  id: PatternLike,
  scope: Array<ENREEntityCollectionScoping>,
  kind: variableKind
) => {
  const buildHelper = (name: string, location: ENRELocation): ENREEntityVariable => {
    return recordEntityVariable(
      name,
      location,
      scope[scope.length - 1],
      kind
    );
  };

  let entity;

  switch (id.type) {
  case 'Identifier':
    entity = buildHelper(
      id.name,
      toENRELocation(id.loc!)
    );
    verbose('VariableDeclaration: ' + entity.name);
    break;

  case 'RestElement':
    entity = buildHelper(
      (id.argument as Identifier).name,
      toENRELocation(id.argument.loc!)
    );
    verbose('VariableDeclaration: ' + entity.name);
    break;

  case 'AssignmentPattern':
    handleBindingPatternRecursively(
      id.left as PatternLike,
      scope,
      kind
    );
    break;

  case 'ObjectPattern':
    for (const property of id.properties) {
      if (property.type === 'RestElement') {
        // It's argument can only be Identifier
        handleBindingPatternRecursively(
          property.argument as RestElement,
          scope,
          kind
        );
      } else {
        // property.type === 'ObjectProperty'
        handleBindingPatternRecursively(
          property.value as PatternLike,
          scope,
          kind
        );
      }
    }
    break;

  case 'ArrayPattern':
    for (const element of id.elements) {
      if (element === null) {
        continue;
      }

      if (element.type === 'RestElement') {
        handleBindingPatternRecursively(
          element.argument as RestElement,
          scope,
          kind
        );
      } else {
        // element.type === 'PatternLike'
        handleBindingPatternRecursively(
          element as PatternLike,
          scope,
          kind
        );
      }
    }
    break;
  }
};

export default (scope: Array<ENREEntityCollectionScoping>) => {
  return (path: NodePath<VariableDeclaration>) => {
    const kind = path.node.kind;
    for (const declarator of path.node.declarations) {
      handleBindingPatternRecursively(declarator.id as PatternLike, scope, kind);
    }
  };
};