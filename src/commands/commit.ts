import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

import { Commit } from "../models/commit.js";
import { getGitPath } from "../utils.js";

export function commit(
  message: string,
  username?: string,
  email?: string,
): void {
  // commit objを生成する
  const commitObj = new Commit();
  commitObj.build(message, username, email);
  commitObj.tree?.dump();
  commitObj.dump();

  // headをhashに書き換える
  let headPath = getGitPath(process.cwd()) + "HEAD";
  const headContent = readFileSync(headPath).toString().trim();
  if (headContent.startsWith("ref: ")) {
    headPath = getGitPath(process.cwd()) + headContent.slice("ref: ".length);
  }
  const headDir = headPath.split("/").slice(0, -1).join("/");
  if (!existsSync(headDir)) {
    mkdirSync(headDir, { recursive: true }); // ディレクトリを再帰的に作成
  }
  // headのhashをcommit objectのhashに置き換える
  // 本家gitでは改行があるのでそれに従う
  writeFileSync(headPath, commitObj.hash + "\x0a");
  console.log(`[${commitObj.hash.slice(0, 7)}] ${message}\n`);
}
