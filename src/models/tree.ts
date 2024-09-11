import * as fs from "node:fs";
import * as crypto from 'crypto';

import { getGitPath } from "../utils.js";
import { Blob } from "./blob.js";
import { Index } from "./index.js";

const index = new Index();

export class Tree {
  directories: Array<Directory>;
  files: Array<File>;
  hash: string;

  constructor(path?: string) {
    this.directories = [];
    this.files = [];

    const currentDir = path ? path : getGitPath(process.cwd()) + "../";
    const files = fs.readdirSync(currentDir);

    files.forEach((fileName) => {
      const fullPathToFile = currentDir + fileName;
      const stats = fs.statSync(fullPathToFile);
      if (stats.isDirectory() && fileName !== '.git') {
        // Direcotryなら再帰
        const dir: Directory = {
          kind: "Directory",
          direcotry: new Tree(fullPathToFile),
          fileName: fullPathToFile,
          authority: stats.mode,
        };

        if (dir.direcotry.files.length !== 0) {
          // 空のディレクトリは含めない
          this.directories.push(dir);
        }
      } else {
        // Fileなので、追跡対象ならfilesに加える
        const item = index
          .entries
          .find(
            (entry) => entry.device === stats.dev && entry.inode === stats.ino,
          );
        if (item) {
          const suffix = item.hashForBlob.slice(0, 2) + "/" + item.hashForBlob.slice(2);
          const pathToBlobObject = getGitPath(process.cwd()) + "objects/" + suffix;
          const file: File = {
            kind: "File",
            blob: new Blob(pathToBlobObject),
            fileName: fileName,
            authority: stats.mode,
          };
          this.files.push(file);
        }
      }
    });

    const content = this.generateObjectContent();
    this.hash = crypto.createHash('sha1')
      .update(content)
      .digest('hex');
  }

  public generateObjectContent(): string {
    // バイナリをwriteしないといけないことに気づいてしまったので一旦放置
    const items: Array<{mode: string; name: string; hash: string }> = [];
    for (const file of this.files) {
      const fileMode = file.authority.toString(8).padStart(6, '0');
      const fileHash = file.blob.hash;
      items.push({ mode: fileMode, name: file.fileName, hash: fileHash });
    }

    for (const dir of this.directories) {
      const dirMode = dir.authority.toString(8).padStart(6, '0');
      const dirHash = dir.direcotry.hash;
      items.push({ mode: dirMode, name: dir.fileName, hash: dirHash });
    }

    const content = items.map(
        item => `${item.mode} ${item.name}\0${Buffer.from(item.hash, 'hex').toString()}`
      )
      .join('');
    const contentWithHeader = `tree ${content.length.toString()}\0${content}`;

    return contentWithHeader;
  }
}

export interface File {
  kind: "File";
  blob: Blob;
  fileName: string;
  authority: number;
}

export interface Directory {
  kind: "Directory";
  direcotry: Tree;
  fileName: string;
  authority: number;
}
