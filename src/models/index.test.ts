import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

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
});
