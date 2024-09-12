import { add } from "./commands/add.js";
import { hello } from "./hello.js";
import { Index } from "./models/index.js";
import { getGitPath } from "./utils.js";

export const mygit = async (argv: Array<string>): Promise<void> => {
  console.log(hello());
  console.log(argv);

  if (argv[2] === "add") {
    const addingFilePath = argv[3];
    if (!addingFilePath) {
      console.error("Please specify the file path to add");
      return;
    }
    console.log(`Adding ${addingFilePath}`);
    await add(addingFilePath);

    const indexPath = getGitPath(process.cwd()) + "index";
    const index = new Index();
    await index.build(indexPath);
    console.log(index.entries);
  }

  // Avoid eslint error by adding some async operation.
  await new Promise((resolve) => setTimeout(resolve, 1000));
};
