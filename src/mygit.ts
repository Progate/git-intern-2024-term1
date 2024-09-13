import { exit } from "process";

import { add } from "./commands/add.js";
import { commit } from "./commands/commit.js";

export const mygit = async (argv: Array<string>): Promise<void> => {
  if (!argv[2]) {
    console.error("Usage: mygit <command> [<args>]");
    exit(1);
  }
  const commandName = argv[2];
  switch (commandName) {
    case "add":
      if (!argv[3]) {
        console.error("Please specify the file path to add");
        return;
      }
      await add(argv[3]);
      break;
    case "commit":
      if (!argv[3]) {
        console.error(
          "Usage: git commit <msg> <name(optional)> <email(optional)>",
        );
        exit(1);
      }
      commit(argv[3], argv[4], argv[5]);
      break;
    default:
      console.error(`Unknown command: ${commandName}`);
  }
  // Avoid eslint error by adding some async operation.
  await new Promise((resolve) => setTimeout(resolve, 1000));
};
