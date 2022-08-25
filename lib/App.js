"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const ink_1 = require("ink");
const commands_1 = __importDefault(require("./commands"));
function getCommand(command) {
    if (!command)
        return undefined;
    return command.charAt(0).toUpperCase() + command.slice(1);
}
const App = ({ command, options }) => {
    const cmd = getCommand(command);
    if (!cmd)
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(ink_1.Text, { color: 'red' }, "Command not found")));
    const Component = commands_1.default[cmd];
    if (!Component)
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(ink_1.Text, { color: 'red' }, `${cmd} is not a command. Please use 'ed-manager --help' and see blow.`)));
    return react_1.default.createElement(Component, { ...options });
};
exports.default = App;
