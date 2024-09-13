import * as fsPromises from "node:fs/promises";

import { Blob } from "../models/blob.js";
import { Entry } from "../models/entry.js";
import { Index } from "../models/index.js";
import { doesFileExist, getGitPath } from "../utils.js";

const getEntryFromFile = async (addingFilePath: string): Promise<Entry> => {
  const fileStat = await fsPromises.stat(addingFilePath, { bigint: true });
  const blob = new Blob();
  const blobHash = await blob.dump(addingFilePath);
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

export const add = async (addingFiles: Array<string>): Promise<void> => {
  const indexPath = getGitPath(process.cwd()) + "index";
  const index = new Index();
  await index.build(indexPath);
  for (const addingFilePath of addingFiles) {
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
  }
  await index.dump(indexPath);
  return;
};
