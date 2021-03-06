"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getApis = getApis;

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getApis(cwd, pattern) {
  const files = _umi().utils.glob.sync(pattern || '**/*.{ts,tsx,js,jsx}', {
    cwd
  }).filter(file => // !file.endsWith('.d.ts') &&
  !file.endsWith('.test.js') && !file.endsWith('.test.jsx') && !file.endsWith('.test.ts') && !file.endsWith('.test.tsx'));

  return files; // return getValidFiles(files, cwd);
}