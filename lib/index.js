#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const ink_1 = require("ink");
const meow_1 = __importDefault(require("meow"));
const App_1 = __importDefault(require("./App"));
const cli = (0, meow_1.default)(`
	Usage
	  $ ed-manager

	Options
		--type next or nest

	Examples
	  $ ed-manager init --type nest 
`, {
    flags: {
        type: {
            type: 'string',
            alias: 't'
        }
    }
});
const command = cli.input[0];
const options = cli.flags;
(0, ink_1.render)(react_1.default.createElement(App_1.default, { command: command, options: options }));
