import { hello } from "./hello.js";
import { uncompressZlib } from "./utils.js";

export const mygit = async (argv: Array<string>): Promise<void> => {
  console.log(hello());
  console.log(argv);

  console.log(uncompressZlib("/Users/ardririy/repos/tmp/.git/objects/6a/30361b9e397c5c30a6938786323dd0e58c54a2")
    .split('\x00')[1]);

  // Avoid eslint error by adding some async operation.
  await new Promise((resolve) => setTimeout(resolve, 1000));
};
