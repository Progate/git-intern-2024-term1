import { readFileSync, writeFileSync } from "node:fs";

import { Commit } from "../models/commit.js";
import { getGitPath } from "../utils.js";

export function commit(
  message: string,
  username?: string,
  email?: string,
): void {
  console.log(message, username, email);

  // commit objを生成する
  const commitObj = new Commit(message, username, email);
  commitObj.dump();

  // headをhashに書き換える
  let headPath = getGitPath(process.cwd()) + "HEAD";
  const headContent = readFileSync(headPath).toString().trim();
  if (headContent.startsWith("ref: ")) {
    headPath = getGitPath(process.cwd()) + headContent.slice("ref: ".length);
  }

  // headのhashをcommit objectのhashに置き換える
  // 本家gitでは改行があるのでそれに従う
  writeFileSync(headPath, commitObj.hash + "\n");
  console.log("commit success");
}
