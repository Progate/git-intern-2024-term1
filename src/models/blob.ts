import { createHash } from "crypto";
import * as fs from "fs/promises";
import { exit } from "process";

import { getGitPath, uncompressZlib } from "../utils.js";

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
    this.content = (await fs.readFile(filePath, "utf-8")).toString();
    const store = `blob ${this.content.length.toString()}\x00${this.content}`;
    const hash = createHash("sha1");
    hash.update(store);
    const sha1 = Buffer.from(hash.digest("hex"), "hex");

    const blobObjPath =
      getGitPath(process.cwd()) +
      "objects/" +
      sha1.subarray(0, 2).toString("hex") +
      "/" +
      sha1.subarray(2).toString("hex");
    const blobBuffer = Buffer.concat([Buffer.from(store), sha1]);
    await fs.writeFile(blobObjPath, blobBuffer);
    return sha1.toString("hex");
  }
}
