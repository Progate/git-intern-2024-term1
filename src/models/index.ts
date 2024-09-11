import { createHash } from "crypto";
import { readFile } from "node:fs/promises";

import { Entry } from "./entry.js";

export class Index {
  version = 2;
  entries: Array<Entry>;
  entryCount: number;
  constructor() {
    this.entries = [];
    this.entryCount = this.entries.length;
  }

  async calcCheckSum(): Promise<string> {
    const rawIndexContents = await readFile(".git/index");
    const bodyData = rawIndexContents.subarray(0, -20);
    const hash = createHash("sha1");
    hash.update(bodyData);
    return hash.digest("hex");
  }
}
