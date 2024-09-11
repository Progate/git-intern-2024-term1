import { exit } from "process";
import { uncompressZlib } from "../utils.js";
import { createHash } from "crypto";

export class Blob {
  content: string;
  hash: string;

  constructor(path: string) {
    // blobのオブジェクトファイルを読み込む
    const data = uncompressZlib(path);

    const hasher = createHash("sha1");
    this.hash = path.split('/').slice(-2).join('');
    hasher.update(data);
    if(this.hash != hasher.digest('hex')) {
      console.error(`Invalid Hash: ${path}`);
      exit(1);
    }

    // レスポンスは"blob <文字数>\x00<content>"という形式なので、\x00までを取り除く
    this.content = data
      .split('\x00')
      .slice(1)
      .join('');
  }
}
