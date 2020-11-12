import path from 'path';
import { EOL } from 'os';
import { readFileSync } from 'fs';
import { utils } from 'umi';

const { t, parser, traverse, winPath } = utils;

export const getPath = (absPath: string) => {
  const info = path.parse(absPath);
  return winPath(path.join(info.dir, info.name).replace(/'/, "'"));
};

export const genCodes = (imports: string[]) =>
  {
    const importItems: string[] = imports
      .map(
        (ele, index) => `import { IRequest as Q${index}, IResponse as P${index} } from "@/${winPath(getPath(ele))}";`,
      );
    const exportItems: string[][] = imports.reduce((pre, _, key) => {
      pre[0].push(`Q${key}`);
      pre[1].push(`P${key}`);
      return pre;
    }, [[], []] as any);
    const codes: any = [
      ...importItems,
      `
interface RequestApis extends ${exportItems[0].join(', ')}{};
interface ResponseApis extends ${exportItems[1].join(', ')}{};

type Request<T extends keyof RequestApis> = RequestApis[T];
type Response<T extends keyof ResponseApis> = ResponseApis[T];
export declare namespace MAPI {
  type ApiKeys = keyof ResponseApis & keyof RequestApis;
  type Request<T extends ApiKeys> = RequestApis[T];
  type Response<T extends ApiKeys> = ResponseApis[T];
};
`,
    ].join(EOL);
    return codes;
  }

export const isValidHook = (filePath: string) => {
  const isTS = path.extname(filePath) === '.ts';
  const isTSX = path.extname(filePath) === '.tsx';
  const content = readFileSync(filePath, { encoding: 'utf-8' }).toString();

  const ast = parser.parse(content, {
    sourceType: 'module',
    plugins: [
      // .ts 不能加 jsx，因为里面可能有 `<Type>{}` 这种写法
      // .tsx, .js, .jsx 可以加
      isTS ? false : 'jsx',
      // 非 ts 不解析 typescript
      isTS || isTSX ? 'typescript' : false,
      // 支持更多语法
      'classProperties',
      'dynamicImport',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'functionBind',
      'nullishCoalescingOperator',
      'objectRestSpread',
      'optionalChaining',
      'decorators-legacy',
    ].filter(Boolean) as utils.parser.ParserPlugin[],
  });
  let valid = false;
  let identifierName = '';
  traverse.default(ast, {
    enter(p) {
      if (p.isExportDefaultDeclaration()) {
        const { type } = p.node.declaration;
        try {
          if (
            type === 'ArrowFunctionExpression' ||
            type === 'FunctionDeclaration'
          ) {
            valid = true;
          } else if (type === 'Identifier') {
            identifierName = (p.node.declaration as utils.t.Identifier).name;
          }
        } catch (e) {
          console.error(e);
        }
      }
    },
  });

  try {
    if (identifierName) {
      ast.program.body.forEach(ele => {
        if (ele.type === 'FunctionDeclaration') {
          if (ele.id?.name === identifierName) {
            valid = true;
          }
        }
        if (ele.type === 'VariableDeclaration') {
          if (
            (ele.declarations[0].id as utils.t.Identifier).name ===
              identifierName &&
            (ele.declarations[0].init as utils.t.ArrowFunctionExpression)
              .type === 'ArrowFunctionExpression'
          ) {
            valid = true;
          }
        }
      });
    }
  } catch (e) {
    valid = false;
  }

  return valid;
};

export const getValidFiles = (files: string[], modelsDir: string) =>
  files
    .map(file => {
      const filePath = path.join(modelsDir, file);
      const valid = isValidHook(filePath);
      if (valid) {
        return filePath;
      }
      return '';
    })
    .filter(ele => !!ele) as string[];
