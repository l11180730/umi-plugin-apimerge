"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
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

var _constants = require("./constants");

var _getTmpFile = require("./utils/getTmpFile");

var _getApis = require("./utils/getApis");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const lodash = _umi().utils.lodash;

var _default = api => {
  const paths = api.paths;

  function getAllApis() {
    return lodash.uniq([...(0, _getApis.getApis)(paths.absSrcPath, `**/api.{ts,tsx,js,jsx}`)]);
  } // Add provider wrapper with rootContainer
  // api.addRuntimePlugin(() => '../plugin-model/runtime');


  api.onGenerateFiles( /*#__PURE__*/_asyncToGenerator(function* () {
    const files = getAllApis();

    try {
      const codes = (0, _getTmpFile.getTmpFile)(files); // IAPI.ts

      api.writeTmpFile({
        content: codes,
        path: `${_constants.DIR_NAME_IN_TMP}/MAPI.ts`
      });
    } catch (e) {
      console.error(e);
    }
  }));
  api.addTmpGenerateWatcherPaths(() => {
    const files = getAllApis();
    return files;
  }); // Export useModel and Models from umi

  api.addUmiExports(() => [{
    exportAll: true,
    source: `../${_constants.DIR_NAME_IN_TMP}/MAPI`
  }]);
};

exports.default = _default;