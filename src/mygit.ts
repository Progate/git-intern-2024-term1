import { isGitRepositoryValid } from "./checks.js";
import { GitRepositoryDestroyedError } from "./errors.js";
import { hello } from "./hello.js";

export const mygit = async (argv: Array<string>): Promise<void> => {
  console.log(hello());
  console.log(argv);
  // Check if the current directory is a valid git repository.
  try {
    await isGitRepositoryValid();
  } catch (error) {
    if (error instanceof GitRepositoryDestroyedError) {
      console.error(error.message);
    } else {
      console.error("予期せぬエラーが発生しました");
    }
  }
  console.log("the current directory is a valid git repository.");

  // Avoid eslint error by adding some async operation.
  await new Promise((resolve) => setTimeout(resolve, 1000));
};
