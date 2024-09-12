import * as fs from "node:fs";
import * as path from "node:path";
import { exit } from "process";
import { inflateSync } from "zlib";

export function uncompressZlib(path: string): string {
  try {
    const data = fs.readFileSync(path);
    const buf = inflateSync(data);
    return buf.toString();
  } catch (e) {
    console.error(`Failed to uncompress file ${path}`, e);
    exit(1);
  }
}

export function getGitPath(dir: string): string {
  const gitDir = path.join(dir, ".git");
  if (fs.existsSync(gitDir) && fs.lstatSync(gitDir).isDirectory()) {
    return gitDir + "/"; // .gitはディレクトリなので終端に/をつけておく
  }

  const parent = path.dirname(dir);
  if (parent == dir) {
    throw Error("Not a git repository");
  }
  return getGitPath(parent);
}

export function fetchHeadHash(): string | undefined {
  const gitRoot = getGitPath(process.cwd());
  const headPath = gitRoot + "HEAD";
  if (!fs.existsSync(headPath)) {
    return undefined;
  }

  const headContent = fs.readFileSync(headPath, "utf-8").trim();
  if (headContent.startsWith("ref: ")) {
    const suffix = headContent.slice(5);
    const path = gitRoot + suffix;
    return fs.readFileSync(path, "utf-8").trim();
  } else {
    // headContentがhashのはずなのでそのまま返す
    return headContent;
  }
}
