import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import { exit } from "node:process";

import { compressZlib, getGitPath, uncompressZlib } from "../utils.js";

export class Blob {
  content: string;
  hash: string;
  constructor() {
    this.content = "";
    this.hash = "";
  }

  public load(path: string): void {
    // blobのオブジェクトファイルを読み込む
    const data = uncompressZlib(path);

    const hasher = createHash("sha1");
    this.hash = path.split("/").slice(-2).join("");
    hasher.update(data);
    if (this.hash != hasher.digest("hex")) {
      console.error(`Invalid Hash: ${path}`);
      exit(1);
    }

    // レスポンスは"blob <文字数>\x00<content>"という形式なので、\x00までを取り除く
    this.content = data.split("\x00").slice(1).join("");
  }

  public async dump(filePath: string): Promise<string> {
    this.content = (await fsPromises.readFile(filePath, "utf-8")).toString();
    const store = `blob ${this.content.length.toString()}\x00${this.content}`;
    const hash = createHash("sha1");
    hash.update(store);
    const sha1 = Buffer.from(hash.digest("hex"), "hex");

    const strHash = sha1.toString("hex");
    const prefix = strHash.slice(0, 2);
    const suffix = strHash.slice(2);
    const blobObjectDir = getGitPath(process.cwd()) + "objects/" + prefix;
    const blobObjPath = blobObjectDir + "/" + suffix;
    if (!fs.existsSync(blobObjectDir)) {
      fs.mkdirSync(blobObjectDir, { recursive: true });
    }
    if (!fs.existsSync(blobObjPath)) {
      await fsPromises.writeFile(
        blobObjPath,
        compressZlib(Buffer.from(store)),
        { mode: 0o444 },
      );
    }
    return sha1.toString("hex");
  }
}
