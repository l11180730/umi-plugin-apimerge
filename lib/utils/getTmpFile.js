"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTmpFile = void 0;

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

var _ = require(".");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getTmpFile = files => {
  const codes = (0, _.genCodes)(files);
  return codes;
};

exports.getTmpFile = getTmpFile;