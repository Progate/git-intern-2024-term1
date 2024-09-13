import { createHash } from "node:crypto";
import * as fsPromises from "node:fs/promises";

import { doesFileExist } from "../utils.js";
import { Entry } from "./entry.js";

export class Index {
  version = 2;
  entries: Array<Entry>;
  constructor() {
    this.entries = [];
  }

  async build(path = ".git/index"): Promise<void> {
    if (!(await doesFileExist(path))) {
      return;
    }
    const buffer = await fsPromises.readFile(path);
    const header = buffer.subarray(0, 12);
    const entryCount = header.readUInt32BE(8);

    let offset = 12;
    for (let i = 0; i < entryCount; i++) {
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
        fileNameLength: buffer.readUInt16BE(offset + 60),
        fileName: "",
      };
      entry.fileName = buffer
        .subarray(offset + 62, offset + 62 + entry.fileNameLength)
        .toString("utf8");
      const currentOffset = offset + 62 + entry.fileNameLength;
      offset = currentOffset + 8 - ((currentOffset - 12) % 8);
      this.entries.push(entry);
    }
  }

  private getEntriesBuffer(): Buffer {
    let entriesBuffer = Buffer.alloc(0);
    for (const entry of this.entries) {
      let entryBufferLength = 62 + entry.fileNameLength;
      entryBufferLength += 8 - (entryBufferLength % 8);
      const entryBuffer = Buffer.alloc(entryBufferLength);
      let offset = 0;
      entryBuffer.writeUInt32BE(entry.ctimeSec, offset);
      offset += 4;
      entryBuffer.writeUInt32BE(entry.ctimeNanoSec, offset);
      offset += 4;
      entryBuffer.writeUInt32BE(entry.mtimeSec, offset);
      offset += 4;
      entryBuffer.writeUInt32BE(entry.mtimeNanoSec, offset);
      offset += 4;
      entryBuffer.writeUInt32BE(entry.device, offset);
      offset += 4;
      entryBuffer.writeUInt32BE(entry.inode, offset);
      offset += 4;
      entryBuffer.writeUInt32BE(entry.mode, offset);
      offset += 4;
      entryBuffer.writeUInt32BE(entry.userID, offset);
      offset += 4;
      entryBuffer.writeUInt32BE(entry.groupID, offset);
      offset += 4;
      entryBuffer.writeUInt32BE(entry.fileSize, offset);
      offset += 4;
      Buffer.from(entry.hashForBlob, "hex").copy(entryBuffer, offset);
      offset += 20;
      entryBuffer.writeUInt16BE(entry.fileNameLength, offset);
      offset += 2;
      Buffer.from(entry.fileName).copy(entryBuffer, offset);
      entriesBuffer = Buffer.concat([entriesBuffer, entryBuffer]);
    }
    return entriesBuffer;
  }

  async dump(indexPath: string): Promise<void> {
    const header = Buffer.alloc(12);
    header.write("DIRC", 0);
    header.writeUInt32BE(this.version, 4);
    header.writeUInt32BE(this.entries.length, 8);
    const entriesBuffer = this.getEntriesBuffer();
    const bodyBuffer = Buffer.concat([header, entriesBuffer]);
    const hash = createHash("sha1");
    hash.update(bodyBuffer);
    const sha1 = Buffer.from(hash.digest("hex"), "hex");
    const indexBuffer = Buffer.concat(
      [bodyBuffer, sha1],
      bodyBuffer.length + sha1.length,
    );
    await fsPromises.writeFile(indexPath, indexBuffer);
  }

  async calcCheckSum(): Promise<string> {
    const rawIndexContents = await fsPromises.readFile(".git/index");
    const bodyData = rawIndexContents.subarray(0, -20);
    const hash = createHash("sha1");
    hash.update(bodyData);
    return hash.digest("hex");
  }
}
