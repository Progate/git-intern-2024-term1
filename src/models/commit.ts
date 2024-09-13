import chalk from "chalk";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import { exit } from "node:process";

import {
  compressZlib,
  fetchHeadHash,
  getGitPath,
  uncompressZlib,
} from "../utils.js";
import { Tree } from "./tree.js";

export class Commit {
  tree?: Tree;
  parent?: string;
  author: string;
  createdAt: number;
  message: string;
  hash: string;
  email: string;

  constructor() {
    this.author = "";
    this.createdAt = 0;
    this.message = "";
    this.hash = "";
    this.email = "";
  }

  public load(hash: string): void {
    const prefix = hash.slice(0, 2);
    const suffix = hash.slice(2);

    const path = getGitPath(process.cwd()) + `objects/${prefix}/${suffix}`;
    const data = uncompressZlib(path);

    const content = data.split("\x00")[1];
    if (!content) {
      console.error("Failed to read commit object");
      exit(1);
    }

    this.hash = hash;
    for (const line of content.split("\n")) {
      if (line.startsWith("parent")) {
        this.parent = line.slice("parent ".length);
      } else if (line.startsWith("author")) {
        const arr = line.split(" ");
        if (arr[1]) this.author = arr[1];
        if (arr[2]) this.email = arr[2].slice(1, -1);
        if (arr[3]) this.createdAt = parseInt(arr[3]);
      }
    }

    this.message = content.split("\n\n")[1]?.slice(0, -1) ?? "";
  }

  public build(message: string, username?: string, email?: string): void {
    this.tree = new Tree();
    this.author = username ?? os.userInfo().username;
    this.email = email ?? os.hostname();
    // unixtime(秒単位)
    this.createdAt = Math.floor(Date.now() / 1000);
    this.message = message;
    this.parent = fetchHeadHash();

    const content = this.generateContent();

    this.hash = createHash("sha1").update(content).digest("hex");
  }

  generateContent(): Buffer {
    const res: Array<Buffer> = [];
    res.push(Buffer.from(`tree ${this.tree?.hash ?? ""}\x0a`, "utf-8"));
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

  public generateReadableMessage(): string {
    let res = chalk.red(`commit ${this.hash}\n`);
    if (this.parent) res += `parent ${this.parent}\n`;
    res += `Author ${this.author} <${this.email}>\n`;
    if (typeof this.createdAt === "number" && !isNaN(this.createdAt)) {
      const date = new Date(this.createdAt * 1000);
      res += `Date: ${date.toISOString()}\n\n`;
    } else {
      res += `Date: Invalid Date\n\n`;
    }
    res += `${this.message}\n`;
    return res;
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

    if (fs.existsSync(path)) return; // ファイルがすでにあるならつくない
    fs.writeFileSync(path, compressedContent, { mode: 0o444 });
  }
}
