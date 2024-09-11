import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

import { Index } from "./index.js";

describe("index", () => {
  it("should print hash of index body", async (t) => {
    const mockedLog = t.mock.method(console, "log");

    // 本リポジトリの .git/index の本文のハッシュ値を計算する
    const index = new Index();
    const indexCheckSumHash = await index.calcCheckSum();
    console.log(indexCheckSumHash);

    // .git/index に記載されたハッシュ値を取得する
    const rawIndexContents = await readFile(".git/index");
    const expectedResult = rawIndexContents.subarray(-20).toString("hex");

    assert.strictEqual(mockedLog.mock.calls[0]?.arguments[0], expectedResult);
  });
});
