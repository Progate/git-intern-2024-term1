import assert from "node:assert";
import { describe, it } from "node:test";

import { getGitPath } from "../utils.js";
import { Blob } from "./blob.js";

describe("Blob", () => {
  it("ファイルパスからオブジェクトが生成されること", () => {
    const path =
      getGitPath(process.cwd()) +
      "../src/tests/objects/3b/18e512dba79e4c8300dd08aeb37f8e728b8dad";
    const blobObject = new Blob();
    blobObject.load(path);
    assert.strict.equal(blobObject.content, "hello world\n");
    assert.strict.equal(
      blobObject.hash,
      "3b18e512dba79e4c8300dd08aeb37f8e728b8dad",
    );
  });
});
