import { Entry } from "./entry.js";

export class Index {
  version: number = 2;
  entries: Array<Entry>;
  entryCount: number;
  constructor() {
    this.entries = [];
    this.entryCount = this.entries.length;
  }
}
