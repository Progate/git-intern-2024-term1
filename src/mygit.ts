import { exit } from "process";

import { add } from "./commands/add.js";
import { commit } from "./commands/commit.js";

export const mygit = async (argv: Array<string>): Promise<void> => {
  console.log(argv);

  if (argv[2] === "add") {
    const addingFilePath = argv[3];
    if (!addingFilePath) {
      console.error("Please specify the file path to add");
      return;
    }
    await add(addingFilePath);
  }

  if (argv[2] === "commit") {
    if (!argv[3]) {
      console.error(
        "Usage: git commit <msg> <name(optional)> <email(optional)>",
      );
      exit(1);
    }
    commit(argv[3], argv[4], argv[5]);
  }
  // Avoid eslint error by adding some async operation.
  await new Promise((resolve) => setTimeout(resolve, 1000));
};
