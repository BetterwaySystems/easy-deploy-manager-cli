import { connection } from "./SSH";
import { installPM2 } from "./installPM2";
import { upload } from "./upload";
import PM2Handler from "./PM2Handler";

export default {
  connection,
  upload,
  installPM2,
  PM2Handler,
};
