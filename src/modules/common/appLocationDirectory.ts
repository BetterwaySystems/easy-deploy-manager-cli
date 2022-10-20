import path from "path";
import fs from "fs";

function getAppLocationDirectories(location: any) {
  const files = fs.readdirSync(location, { withFileTypes: true });
  const directoriesInDIrectory = files.map((item: any) => {
    if (item.isDirectory()) {
      return {
        type: "directory",
        name: item.name,
      };
    } else {
      return {
        ext: path.extname(item.name),
        type: "file",
        name: item.name,
      };
    }
  });

  return directoriesInDIrectory;
}

export default getAppLocationDirectories;
