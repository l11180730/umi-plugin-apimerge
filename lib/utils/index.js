"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getValidFiles = exports.isValidHook = exports.genCodes = exports.getPath = void 0;

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

function _path() {
  const data = _interopRequireDefault(require("path"));

  _path = function _path() {
    return data;
  };

  return data;
}

function _os() {
  const data = require("os");

  _os = function _os() {
    return data;
  };

  return data;
}

function _fs() {
  const data = require("fs");

  _fs = function _fs() {
    return data;
  };

  return data;
}

function _umi() {
  const data = require("umi");

  _umi = function _umi() {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const t = _umi().utils.t,
      parser = _umi().utils.parser,
      traverse = _umi().utils.traverse,
      winPath = _umi().utils.winPath;

const getPath = absPath => {
  const info = _path().default.parse(absPath);

  return winPath(_path().default.join(info.dir, info.name).replace(/'/, "'"));
};

exports.getPath = getPath;

const genCodes = imports => {
  const importItems = imports.map((ele, index) => `import { IRequest as Q${index}, IResponse as P${index} } from "@/${winPath(getPath(ele))}";`);
  const exportItems = imports.reduce((pre, _, key) => {
    pre[0].push(`Q${key}`);
    pre[1].push(`P${key}`);
    return pre;
  }, [[], []]);
  const codes = [...importItems, `
interface RequestApis extends ${exportItems[0].join(', ')}{};
interface ResponseApis extends ${exportItems[1].join(', ')}{};

type Request<T extends keyof RequestApis> = RequestApis[T];
type Response<T extends keyof ResponseApis> = ResponseApis[T];
export declare namespace MAPI {
  type ApiKeys = keyof ResponseApis & keyof RequestApis;
  type Request<T extends ApiKeys> = RequestApis[T];
  type Response<T extends ApiKeys> = ResponseApis[T];
};
`].join(_os().EOL);
  return codes;
};

exports.genCodes = genCodes;

const isValidHook = filePath => {
  const isTS = _path().default.extname(filePath) === '.ts';
  const isTSX = _path().default.extname(filePath) === '.tsx';
  const content = (0, _fs().readFileSync)(filePath, {
    encoding: 'utf-8'
  }).toString();
  const ast = parser.parse(content, {
    sourceType: 'module',
    plugins: [// .ts 不能加 jsx，因为里面可能有 `<Type>{}` 这种写法
    // .tsx, .js, .jsx 可以加
    isTS ? false : 'jsx', // 非 ts 不解析 typescript
    isTS || isTSX ? 'typescript' : false, // 支持更多语法
    'classProperties', 'dynamicImport', 'exportDefaultFrom', 'exportNamespaceFrom', 'functionBind', 'nullishCoalescingOperator', 'objectRestSpread', 'optionalChaining', 'decorators-legacy'].filter(Boolean)
  });
  let valid = false;
  let identifierName = '';
  traverse.default(ast, {
    enter(p) {
      if (p.isExportDefaultDeclaration()) {
        const type = p.node.declaration.type;

        try {
          if (type === 'ArrowFunctionExpression' || type === 'FunctionDeclaration') {
            valid = true;
          } else if (type === 'Identifier') {
            identifierName = p.node.declaration.name;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

  });

  try {
    if (identifierName) {
      ast.program.body.forEach(ele => {
        if (ele.type === 'FunctionDeclaration') {
          var _ele$id;

          if (((_ele$id = ele.id) === null || _ele$id === void 0 ? void 0 : _ele$id.name) === identifierName) {
            valid = true;
          }
        }

        if (ele.type === 'VariableDeclaration') {
          if (ele.declarations[0].id.name === identifierName && ele.declarations[0].init.type === 'ArrowFunctionExpression') {
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

exports.isValidHook = isValidHook;

const getValidFiles = (files, modelsDir) => files.map(file => {
  const filePath = _path().default.join(modelsDir, file);

  const valid = isValidHook(filePath);

  if (valid) {
    return filePath;
  }

  return '';
}).filter(ele => !!ele);

exports.getValidFiles = getValidFiles;