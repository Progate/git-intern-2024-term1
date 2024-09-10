export interface Entry {
  ctimeSec: number;
  ctimeNanoSec: number;
  mtimeSec: number;
  mtimeNanoSec: number;
  device: number;
  inode: number;
  userID: number;
  groupID: number;
  fileSize: number;
  mode: number;
  hashForBlob: string;
  fileNameLength: number;
  fileName: string;
}
