import * as fs from "fs";
import * as path from "path";

import { getGitPath, uncompressZlib } from "./utils.js";

const fetchHead = (): string => {
  const gitPath = getGitPath(process.cwd());
  const data = fs.readFileSync(path.join(gitPath, "HEAD"), "utf-8").trim();
  const hash = ((): string => {
    if (data.startsWith("ref:")) {
      const [, hashFilePath] = data.split(": ");
      if (!hashFilePath) {
        throw Error("cannot read HEAD hash");
      }

      const hash = fs.readFileSync(path.join(gitPath, hashFilePath), "utf-8");
      return hash.trim(); // 改行文字を取り除いておいく
    } else {
      return data;
    }
  })();

  return hash;
};

function fetchCommitObject(hash: string): Array<string> {
  const gitPath = getGitPath(process.cwd());
  const folderName = hash.slice(0, 2);
  const fileName = hash.slice(2);
  const commitObjFilePath = `${gitPath}/objects/${folderName}/${fileName}`;

  const data = uncompressZlib(commitObjFilePath);
  if (!data) throw Error("failed to get logs");

  const message = data.split("\0")[1];
  if (!message) throw Error("cannot parse message");

  const res = [`commit ${hash}\n` + message.split("\n").slice(1).join("\n")];

  // 次のデータを探す
  const nextHashLine = data
    .split("\n")
    .find((line) => line.startsWith("parent"));
  if (nextHashLine) {
    const nextHash = nextHashLine.split(" ")[1];
    if (!nextHash) throw Error("Unknown Error");
    res.concat(fetchCommitObject(nextHash.trim()));
  }
  return res;
}

export const log = (argv: Array<string>): string => {
  if (!argv[2]) throw Error("unknown error(no subcommand found)");
  const hash = fetchHead();
  const messages = fetchCommitObject(hash);
  return messages.join("\n");
};
