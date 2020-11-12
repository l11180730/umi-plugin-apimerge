import { genCodes } from '.';

export const getTmpFile = (
  files: string[],
) => {
  const codes = genCodes(files);

  return codes;
};
