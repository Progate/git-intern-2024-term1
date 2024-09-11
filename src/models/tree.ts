import { Blob } from './blob.js'

export class Tree {
  directories: Array<Directory>;
  files: Array<File>;
  hash: string;

  constructor() {
    this.directories = [];
    this.files = [];
    this.hash = "";
  }
}

export interface File {
  blob: Blob;
  fileName: string;
  authority: number;
}

export interface Directory {
  direcotry: Tree;
  fileName: string;
  authority: number;
}
