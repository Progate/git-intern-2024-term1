import { Tree } from "./tree.js";

export class Commit {
  tree: Tree;
  parent: string;
  author: string;
  createdAt: number;
  message: string;
  hash: string;

  constructor() {
    this.tree = new Tree();
    this.parent = "";
    this.author = "";
    this.createdAt = 0;
    this.message = "";
    this.hash = "";
  }
}
