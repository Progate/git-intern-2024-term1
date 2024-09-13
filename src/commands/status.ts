import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";

// import { exit } from "node:process";
// import { Commit } from "../models/commit.js";
import { Index } from "../models/index.js";
import { getGitPath } from "../utils.js";

export function fetchFilesIn(path: string): Array<string> {
  // pathのディレクトリ内のファイルを再帰的に取得
  const files = fs.readdirSync(path);
  const result: Array<string> = [];
  files.forEach((file) => {
    if (file.startsWith(".")) return
    const fullPath = path + "/" + file;
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      result.push(...fetchFilesIn(fullPath));
    } else {
      result.push(fullPath);
    }
  });
  return result;
}

export const status = async (): Promise<void> => {
  const gitRoot = getGitPath(process.cwd());
  const headPath = gitRoot + "HEAD";
  if (!fs.existsSync(headPath)) {
    return undefined;
  }
  // ブランチ名/HEADコミットを表示
  const headContent = await fsPromises.readFile(headPath, "utf-8");
  let hash: string | undefined;
  if (headContent.startsWith("ref: ")) {
    const branchName = headContent.slice(16); // ブランチ名のみ  headContent = "ref: refs/heads/BRANCH"
    console.info(`On branch ${branchName.trim()}`);
    const path = gitRoot + headContent.slice(5).trim();
    if (fs.existsSync(path)) {
      hash = await fsPromises.readFile(path, "utf-8");
      hash = hash.trim();
    } else {
      console.info("\nNo commits yet");
    }
  } else {
    hash = headContent.trim();
  }
  // ステージ <-> リポジトリの差分
  // 一個前のコミットのindexが取得できないのでスルー
  // if (hash) {
  //   const commit = new Commit();
  //   commit.load(hash);
  //   console.info(`HEAD commit: ${commit.author}`);
  // }
  console.log("recent commit hash: ", hash);

  // ワーキングツリー <-> ステージの差分
  // 実装なし

  // 未追跡のファイル
  const index = new Index();
  await index.build(".git/index");
  const files = fetchFilesIn(process.cwd());
  const trackedFiles = index.entries.map((entry) => entry.inode);
  const untrackedFiles = files.filter(
    (file) =>
      !trackedFiles.includes(fs.statSync(file).ino),
  );
  console.info("\nUntracked files:");
  untrackedFiles.forEach((file) => {
    console.info(`\t${file}`);
  });
  return;
};
