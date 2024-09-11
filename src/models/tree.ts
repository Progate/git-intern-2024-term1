import * as fs from "node:fs";

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
      if (stats.isDirectory()) {
        // Direcotryなら再帰
        const dir: Directory = {
          kind: "Directory",
          direcotry: new Tree(fullPathToFile),
          fileName: fullPathToFile,
          authority: stats.mode,
        };

        if (dir.direcotry.files.length !== 0) {
          this.directories.push(dir);
        }
      } else {
        // Fileなので、追跡対象ならfilesに加える
        if (
          index.entries.some(
            (entry) => entry.device === stats.dev && entry.inode === stats.ino,
          )
        ) {
          const file: File = {
            kind: "File",
            blob: new Blob(fullPathToFile),
            fileName: fileName,
            authority: stats.mode,
          };
          this.files.push(file);
        }
      }
    });
    this.hash = "";
  }

  // public generateObjectcontent(): string {
  //   const items = [...this.files, ...this.directories].sort((x, y) => x.fileName.localeCompare(y.fileName));
  //   let res = [];
  //   for (const item of items) {
  //     if(item.kind === "Directory") {
  //       res.push(`${item.authority} blob ${item.direcotry.hash}} `)
  //     }
  //   }
  // }
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
