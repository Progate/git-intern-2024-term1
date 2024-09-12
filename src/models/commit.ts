import { fetchHeadHash } from "../utils.js";
import * as crypto from "crypto";
import * as fs from "node:fs";
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
    this.parent = fetchHeadHash();

    const content = this.generateContent();

    // デバッグ用: 一つ下の階層にバイナリデータをファイルに書き込み
    // レポジトリルートでやるとレポジトリにoutput.binが絶対含まれないので安全(mygitではignoreできない)
    fs.writeFileSync('../output.bin', content);
    this.hash = crypto.createHash("sha1").update(content).digest("hex");
  }

  generateContent(): Buffer {
    const res :Array<Buffer> = [];
    res.push(Buffer.from(`tree ${this.tree.hash}\x0a`, "utf-8"));
    if(this.parent) {
      res.push(Buffer.from(`parent ${this.parent}\x0a`, "utf-8"));
    }

    res.push(Buffer.from(`author ${this.author} <${this.email}> ${this.createdAt.toString()} +0900\x0a`));
    res.push(Buffer.from(`committer ${this.author} <${this.email}> ${this.createdAt.toString()} +0900\x0a\x0a`))
    res.push(Buffer.from(`${this.message}\x0a`));
    const contentBody = Buffer.concat(res);
    const contentHeader = Buffer.from(`commit ${contentBody.length.toString()}\x00`);
    return Buffer.concat([contentHeader, contentBody]);
  }
}
