import { add } from "./commands/add.js";
import { hello } from "./hello.js";

export const mygit = async (argv: Array<string>): Promise<void> => {
  console.log(hello());
  console.log(argv);

  if (argv[2] === "add") {
    const addingFilePath = argv[3];
    if (!addingFilePath) {
      console.error("Please specify the file path to add");
      return;
    }
    await add(addingFilePath);
  }

  // Avoid eslint error by adding some async operation.
  await new Promise((resolve) => setTimeout(resolve, 1000));
};
