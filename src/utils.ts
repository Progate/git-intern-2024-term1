import * as fs from "fs";
import * as path from "path";
import { inflateSync } from "zlib";

export function uncompressZlib(path: string): string | null {
  try {
    const data = fs.readFileSync(path);
    const buf = inflateSync(data);
    return buf.toString();
  } catch {
    return null;
  }
}

export function getGitPath(dir: string): string {
  const gitDir = path.join(dir, ".git");
  if (fs.existsSync(gitDir) && fs.lstatSync(gitDir).isDirectory()) {
    return gitDir;
  }

  const parent = path.dirname(dir);
  if (parent == dir) {
    throw Error("not a git repository");
  }
  return getGitPath(parent);
}
