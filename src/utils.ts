import * as fs from 'fs';
import { inflateSync } from 'zlib';

export function uncompressZlib(path: string): string | null {
  try {
    const data = fs.readFileSync(path);
    const buf = inflateSync(data);
    return buf.toString();
  } catch (err) {
    return null;
  }
}
