import { readFileSync } from 'fs';

/**
 * Parsing file as json
 * @param {string} path - is file location for reading
 * @returns parsed json
 */
const parseJsonFile = (path: string) => {
  try { 
    const fileData = readFileSync(path, 'utf8');
    return JSON.parse(fileData);
  } catch(err) {
    throw err;
  }
}

/**
 * Paring easy-deploy.json file as json
 * @param {string} config - is user defined easy-deploy file location
 * @returns init parsed json
 */
const getConfig = (config?: string) => {
  try {
    const filePath = config ?? `${process.cwd()}/easy-deploy.json`;
    const initDefaultJson = parseJsonFile(filePath);
    return initDefaultJson;
  } catch(err) {
    throw err;
  }
}


export { parseJsonFile, getConfig };
