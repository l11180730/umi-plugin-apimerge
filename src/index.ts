import { join } from 'path';
import { IApi, utils } from 'umi';
import { DIR_NAME_IN_TMP } from './constants';
import { getTmpFile } from './utils/getTmpFile';
import { getApis } from './utils/getApis';
import { readFileSync } from 'fs';
const { lodash } = utils;

export default (api: IApi) => {
  const {
    paths,
  } = api;

  function getAllApis() {
    return lodash.uniq([
      ...getApis(paths.absSrcPath!, `**/api.{ts,tsx,js,jsx}`),
    ]);
  }

  // Add provider wrapper with rootContainer
  // api.addRuntimePlugin(() => '../plugin-model/runtime');

  api.onGenerateFiles(async () => {
    const files = getAllApis();

    try {
      const codes = getTmpFile(files);

      // IAPI.ts
      api.writeTmpFile({
        content: codes,
        path: `${DIR_NAME_IN_TMP}/MAPI.ts`,
      });
    } catch (e) {
      console.error(e);
    }
  });

  api.addTmpGenerateWatcherPaths(() => {
    const files = getAllApis();
    return files;
  });

  // Export useModel and Models from umi
  api.addUmiExports(() => [
    {
      exportAll: true,
      source: `../${DIR_NAME_IN_TMP}/MAPI`,
    },
  ]);
};
