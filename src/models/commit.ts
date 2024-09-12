import { fetchHeadHash } from "../utils.js";
import { Tree } from "./tree.js";
import * as os from 'os';

export class Commit {
  tree: Tree;
  parent?: string;
  author: string;
  createdAt: number;
  message: string;
  hash: string;
  email: string;

  constructor(message: string, username?: string, email?: string) {
    this.tree = new Tree();
    this.author = username ?? os.userInfo().username;
    this.email = email ?? os.hostname();
    // unixtime(秒単位)
    this.createdAt =  Math.floor(Date.now() / 1000);
    this.message = message;
    this.hash = fetchHeadHash();
  }

  // generateContent(): Buffer {

  // }
}
