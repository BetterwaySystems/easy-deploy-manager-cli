import { readFileSync } from 'fs';

/**
 * Parsing the easy-deploy file as json
 * @returns easy-deploy.json
 */
const parseInitJsonFile = () => {
  const initDefaultFile = readFileSync(`${process.cwd()}/easy-deploy.json`, 'utf8');
  const initDefaultJson: IDefaultInitInfo = JSON.parse(initDefaultFile);

  return initDefaultJson;
};

export { parseInitJsonFile };
