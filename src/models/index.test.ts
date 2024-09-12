import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

import { getGitPath } from "../utils.js";
import { Index } from "./index.js";

describe("index", () => {
  it("計算したindexファイルの本文のハッシュ値が末尾のチェックサムの値と一致するか", async () => {
    // 本リポジトリの .git/index の本文のハッシュ値を計算する
    const index = new Index();
    const indexCheckSumHash = await index.calcCheckSum();

    // .git/index に記載されたハッシュ値を取得する
    const rawIndexContents = await readFile(".git/index");
    const expectedResult = rawIndexContents.subarray(-20).toString("hex");

    assert.strictEqual(indexCheckSumHash, expectedResult);
  });

  it("indexファイルから読み取ったエントリ数が正しいか", async () => {
    console.log(process.cwd());
    const indexPath = getGitPath(process.cwd()) + "../src/tests/index";
    const index = new Index();
    await index.build(indexPath);
    assert.strictEqual(index.entries.length, 3);
    assert.strictEqual(index.entries[2]?.fileName, "dir/ab.txt");
  });

  it("indexファイルのコピーを正常に書き出せるか", async () => {
    const indexPath = "./src/tests/index";
    const myIndexPath = "./src/tests/myindex";

    const index = new Index();
    await index.build(indexPath);
    await index.dump(myIndexPath);

    const myIndex = new Index();
    await myIndex.build(myIndexPath);

    assert.deepStrictEqual(index.entries, myIndex.entries);
  });
});
