import { exit } from "process";
import { commit } from "./commands/commit.js";
import { hello } from "./hello.js";

export const mygit = async (argv: Array<string>): Promise<void> => {
  console.log(hello());
  console.log(argv);

  if(argv[2] === "commit") {
    if(!argv[3]) {
      console.error("Usage: git commit <msg> <name(optional)> <email(optional)>");
      exit(1);
    }
    commit(argv[3], argv[4], argv[5]);
  }
  // Avoid eslint error by adding some async operation.
  await new Promise((resolve) => setTimeout(resolve, 1000));
};
