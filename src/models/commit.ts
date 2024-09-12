import * as crypto from "crypto";
import * as fs from "fs";
import * as os from "os";

import { compressZlib, fetchHeadHash, getGitPath } from "../utils.js";
import { Tree } from "./tree.js";

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
    this.createdAt = Math.floor(Date.now() / 1000);
    this.message = message;
    this.parent = fetchHeadHash();

    const content = this.generateContent();

    this.hash = crypto.createHash("sha1").update(content).digest("hex");
  }

  generateContent(): Buffer {
    const res: Array<Buffer> = [];
    res.push(Buffer.from(`tree ${this.tree.hash}\x0a`, "utf-8"));
    if (this.parent) {
      res.push(Buffer.from(`parent ${this.parent}\x0a`, "utf-8"));
    }

    res.push(
      Buffer.from(
        `author ${this.author} <${this.email}> ${this.createdAt.toString()} +0900\x0a`,
      ),
    );
    res.push(
      Buffer.from(
        `committer ${this.author} <${this.email}> ${this.createdAt.toString()} +0900\x0a\x0a`,
      ),
    );
    res.push(Buffer.from(`${this.message}\x0a`));
    const contentBody = Buffer.concat(res);
    const contentHeader = Buffer.from(
      `commit ${contentBody.length.toString()}\x00`,
    );
    return Buffer.concat([contentHeader, contentBody]);
  }

  public dump(): void {
    const content = this.generateContent();
    const compressedContent = compressZlib(content);

    const prefix = this.hash.slice(0, 2);
    const suffix = this.hash.slice(2);
    const objectDir = getGitPath(process.cwd()) + "objects/" + prefix;
    const path = objectDir + "/" + suffix;

    if (!fs.existsSync(objectDir)) {
      fs.mkdirSync(objectDir, { recursive: true }); // ディレクトリを再帰的に作成
    }
    fs.writeFileSync(path, compressedContent);
  }
}
