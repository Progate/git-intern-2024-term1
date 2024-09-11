import { getGitPath } from "../utils.js";
import { Tree } from "./tree.js";
import * as fs from "node:fs";

export class Commit {
  tree: Tree;
  parent?: string;
  author: string;
  createdAt: number;
  message: string;
  hash: string;

  constructor(message: string) {
    this.tree = new Tree();
    const config = fs
      .readFileSync((getGitPath(process.cwd()) + "config"))
      .toString();


    console.log(config);
    this.author = "";
    // unixtime(秒単位)
    this.createdAt =  Math.floor(Date.now() / 1000);
    this.message = message;
    this.hash = "";
  }
}
