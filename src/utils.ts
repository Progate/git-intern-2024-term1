import { promises as fs } from "fs";
import { readFile } from "fs/promises";

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
