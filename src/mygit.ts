import { log } from "./log.js";

export const mygit = async (argv: Array<string>): Promise<void> => {
  if(argv[2] == "log") {
    console.log(log(argv));
    return;
  }

  // Avoid eslint error by adding some async operation.
  await new Promise((resolve) => setTimeout(resolve, 1000));
};
