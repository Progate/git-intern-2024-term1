import { readZlibFile } from "./utils.js"


export class GitCommitObject {
  path: string
  tree: string
  parent: GitCommitObject | undefined
  author: string
  committer: string
  message: string
  constructor(
    public hash: string,
  ) {
    this.hash = ""
    this.path = ""
    this.tree = ""
    this.parent = undefined
    this.author = ""
    this.committer = ""
    this.message = ""
  }
  public static async build(hash: string): Promise<GitCommitObject>{
    const gitCommitObject = new GitCommitObject(hash);
    gitCommitObject.hash = hash
    gitCommitObject.path = `.git/objects/${hash.slice(0, 2)}/${hash.slice(2)}`
    // const planeText: string = await readZlibFile(gitCommitObject.path);
    // console.log(planeText.split("\n"))
    // for (const line of planeText.split("\n")) {
    //   if (line.startsWith("tree")) {
    //     gitCommitObject.tree = line.split(" ")[1]
    //   } else if (line.startsWith("parent")) {
    //     gitCommitObject.parent = new GitCommitObject(line.split(" ")[1])
    //   } else if (line.startsWith("author")) {
    //     gitCommitObject.author = line.slice(7)
    //   } else if (line.startsWith("committer")) {
    //     gitCommitObject.committer = line.slice(10)
    //   } else {
    //     gitCommitObject.message = line
    //   }
    // }

    gitCommitObject.tree = ""
    gitCommitObject.parent = undefined
    gitCommitObject.author = ""
    gitCommitObject.committer = ""
    gitCommitObject.message = ""
    return gitCommitObject;
  }
}

export class GitTreeObject {
  constructor(
    public hash: string,
  ) {
    this.hash = hash
  }
}

export class GitBlobObject {
  constructor(
    public hash: string,
  ) {
    this.hash = hash
  }
}
