import crypto from "node:crypto";
import { stat } from "node:fs/promises";
import { readFile } from "node:fs/promises";

import { Entry } from "../models/entry.js";
import { Index } from "../models/index.js";
import { doesFileExist, getGitPath } from "../utils.js";

const genBlobSha1 = async (filePath: string): Promise<string> => {
  const file = await readFile(filePath);
  const content = file.toString();
  const header = `blob ${content.length.toString()}\0`;
  const store = header + content;
  const shasum = crypto.createHash("sha1");
  shasum.update(store);
  const sha1 = shasum.digest("hex");

  return sha1;
};

const getEntryFromFile = async (addingFilePath: string): Promise<Entry> => {
  const fileStat = await stat(addingFilePath, { bigint: true });
  const blobHash = await genBlobSha1(addingFilePath);
  return {
    ctimeSec: Number((fileStat.ctime.getTime() / 1000).toFixed(0)),
    ctimeNanoSec: Number(fileStat.ctimeNs % 1000000000n),
    mtimeSec: Number((fileStat.mtime.getTime() / 1000).toFixed(0)),
    mtimeNanoSec: Number(fileStat.mtimeNs % 1000000000n),
    device: Number(fileStat.dev),
    inode: Number(fileStat.ino),
    mode: Number(fileStat.mode),
    userID: Number(fileStat.uid),
    groupID: Number(fileStat.gid),
    fileSize: Number(fileStat.size),
    hashForBlob: blobHash,
    fileNameLength: addingFilePath.length,
    fileName: addingFilePath,
  };
};

export const add = async (addingFilePath: string): Promise<void> => {
  const indexPath = getGitPath(process.cwd()) + "index";
  const index = new Index();
  if (await doesFileExist(indexPath)) {
    await index.build(indexPath);
  }
  const isFileExists = await doesFileExist(addingFilePath);
  const existingEntryIndex = index.entries.findIndex(
    (entry) => entry.fileName === addingFilePath,
  );
  if (!isFileExists && existingEntryIndex === -1) {
    return;
  }
  if (isFileExists && existingEntryIndex !== -1) {
    // 更新
    const newEntry = await getEntryFromFile(addingFilePath);
    index.entries[existingEntryIndex] = newEntry;
  }
  if (isFileExists && existingEntryIndex === -1) {
    // 追加
    const newEntry = await getEntryFromFile(addingFilePath);
    index.entries.push(newEntry);
  }
  if (!isFileExists && existingEntryIndex !== -1) {
    // 削除
    index.entries = [
      ...index.entries.slice(0, existingEntryIndex),
      ...index.entries.slice(existingEntryIndex + 1),
    ];
  }
  await index.dump(indexPath);
  return;
};
