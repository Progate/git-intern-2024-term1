import { GitRepositoryDestroyedError } from "./errors.js";
import { isDirExists, isFileExists } from "./utils.js";

const requiredFolders: Array<string> = [".git/objects", ".git/refs/heads"];

const requiredFiles: Array<string> = [".git/HEAD"];

export const isGitRepositoryValid = async (): Promise<boolean> => {
  for (const folder of requiredFolders) {
    if (!(await isDirExists(folder))) {
      throw new GitRepositoryDestroyedError();
    }
  }
  for (const file of requiredFiles) {
    if (!(await isFileExists(file))) {
      throw new GitRepositoryDestroyedError();
    }
  }
  return true;
};
