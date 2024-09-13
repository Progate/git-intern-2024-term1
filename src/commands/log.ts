import { Commit } from "../models/commit.js";
import { fetchHeadHash } from "../utils.js";

export function log():void {
  const hash = fetchHeadHash();
  if(hash) {
    console.log(createLog(hash).join("\n"));
  } else {
    console.log("No commit found.");
  }
}

function createLog(hash: string): Array<string> {
  const commit = new Commit();
  commit.load(hash);
  const ret = [commit.generateReadableMessage()];
  if (commit.parent) {
    return ret.concat(createLog(commit.parent));
  }
  return ret;
}
