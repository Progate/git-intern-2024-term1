import { isGitRepositoryValid } from "./checks.js";
import { GitRepositoryDestroyedError } from "./errors.js";
import { hello } from "./hello.js";
import { isFileExists, readTextFile } from "./utils.js";

export const mygit = async (argv: Array<string>): Promise<void> => {
  console.log(hello());
  console.log(argv);
  if (argv[2] === "log") {
    return await log();
  }
  // Avoid eslint error by adding some async operation.
  await new Promise((resolve) => setTimeout(resolve, 1000));
};


const log = async (): Promise<void> =>{
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

  // read .git/HEAD
  let headText: string = "";
  try {
    headText = await readTextFile(".git/HEAD");
  } catch (error) {
    console.error("HEADファイルの読み込み中にエラーが発生しました:", error);
  }
  console.log("HEADファイルの内容:", headText);

  // read the commit object hash from the ref file
  let commitObjectHash: string = "";
  if (headText.includes("ref: refs/heads/")) {
    const refPath = headText.slice(5, -1).trim();
    try {
      commitObjectHash = await readTextFile(`.git/${refPath}`);
    } catch (error) {
      if (!(await isFileExists(`.git/${refPath}`))) {
        const branchName = refPath.split("/").pop();
        console.error(`現在のブランチ' ${branchName}' にはまだコミットがありません`);
      } else {
        console.error("コミットオブジェクトのハッシュ値の取得中に予期せぬエラーが発生しました:", error);
      }
      return
    }
    commitObjectHash = commitObjectHash.trim();
  } else {
    commitObjectHash = headText.trim();
  }
  console.log("最新のコミットオブジェクトのハッシュ値:", commitObjectHash);
}