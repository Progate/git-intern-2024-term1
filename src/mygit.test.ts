import assert from "node:assert";
import { describe, it } from "node:test";

import { mygit } from "./mygit.js";

describe("mygit", () => {
  it("should print hello world", async (t) => {
    const mockedLog = t.mock.method(console, "log");
    await mygit(["node", "mygit", "status"]);
    assert.strictEqual(mockedLog.mock.calls.length, 2);
    assert.strictEqual(mockedLog.mock.calls[0]?.arguments[0], "hello world");
  });
});
