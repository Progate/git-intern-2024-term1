import { promises as fs } from "fs";
import { readFile } from "fs/promises";

import * as zlib from 'zlib';

export const isFileExists = async (path: string): Promise<boolean> => {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
};

export const isDirExists = async (path: string): Promise<boolean> => {
  try {
    const stats = await fs.stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
};

export const readTextFile = async (filePath: string): Promise<string> => {
  try {
    const data = await readFile(filePath, "utf-8");
    return data;
  } catch (err) {
    throw err;
  }
};

export const readZlibFile = async (filePath: string): Promise<string> => {
  let result = "";
  const data = await readFile(filePath);
  try {
    result = zlib.unzipSync(data).toString();
    return result;
  } catch (err) {
    throw err;
  }
};
