import { readFileSync } from 'fs';

/**
 * Parsing file as json
 * @param {string} path - is file location for reading
 * @returns parsed json
 */
const parseJsonFile = (path: string) => {
  const fileData = readFileSync(path, 'utf8');
  return JSON.parse(fileData);
}

/**
 * Paring easy-deploy.json file as json
 * @param {string} config - is user defined easy-deploy file location
 * @returns init parsed json
 */
const getInitJsonFile = (config: string) => {
  const filePath = config ?? `${process.cwd()}/easy-deploy.json`;
  const initDefaultJson = parseJsonFile(filePath);
  return initDefaultJson;
}


export { parseJsonFile, getInitJsonFile };
