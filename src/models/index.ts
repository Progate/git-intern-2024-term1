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

  async build(path: string): Promise<void> {
    const buffer = await readFile(path);
    const header = buffer.subarray(0, 12);
    this.entryCount = header.readUInt32BE(8);

    let offset = 12;
    while (offset < buffer.length) {
      const entry: Entry = {
        ctimeSec: buffer.readUInt32BE(offset),
        ctimeNanoSec: buffer.readUInt32BE(offset + 4),
        mtimeSec: buffer.readUInt32BE(offset + 8),
        mtimeNanoSec: buffer.readUInt32BE(offset + 12),
        device: buffer.readUInt32BE(offset + 16),
        inode: buffer.readUInt32BE(offset + 20),
        mode: buffer.readUInt32BE(offset + 24),
        userID: buffer.readUInt32BE(offset + 28),
        groupID: buffer.readUInt32BE(offset + 32),
        fileSize: buffer.readUInt32BE(offset + 36),
        hashForBlob: buffer.subarray(offset + 40, offset + 60).toString("hex"),
        fileNameLength: 0,
        fileName: "",
      };
      const flags = buffer.readUInt16BE(offset + 60);
      entry.fileNameLength = flags & 0x0fff;
      entry.fileName = buffer
        .subarray(offset + 62, offset + 62 + entry.fileNameLength)
        .toString("utf8");
      offset += 62 + entry.fileNameLength;
      offset = Math.ceil(offset / 8) * 8;
      this.entries.push(entry);
    }
  }

  async calcCheckSum(): Promise<string> {
    const rawIndexContents = await readFile(".git/index");
    const bodyData = rawIndexContents.subarray(0, -20);
    const hash = createHash("sha1");
    hash.update(bodyData);
    return hash.digest("hex");
  }
}
