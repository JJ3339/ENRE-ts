import {ENREEntityCollectionScoping, ENREEntityFile, id,} from '@enre-ts/data';
import {logger} from '@enre-ts/core';

export class ENREScope extends Array<ENREEntityCollectionScoping> {
  
  constructor(file: ENREEntityFile) {
    super();
    this.push(file);
  }

  last = <T = ENREEntityCollectionScoping>() => {
    if (this.length >= 1) {
      return this.at(-1) as T;
    } else {
      logger.error('The scope stack is empty, which indicates the scope management is broken.');
      process.exit();
    }
  };
}
