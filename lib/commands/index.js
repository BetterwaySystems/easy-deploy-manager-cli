"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Build_1 = __importDefault(require("./Build"));
const Deploy_1 = __importDefault(require("./Deploy"));
const Init_1 = __importDefault(require("./Init"));
const Revert_1 = __importDefault(require("./Revert"));
const Scale_1 = __importDefault(require("./Scale"));
const Start_1 = __importDefault(require("./Start"));
const Status_1 = __importDefault(require("./Status"));
const Stop_1 = __importDefault(require("./Stop"));
exports.default = {
    Build: Build_1.default,
    Deploy: Deploy_1.default,
    Init: Init_1.default,
    Revert: Revert_1.default,
    Scale: Scale_1.default,
    Start: Start_1.default,
    Status: Status_1.default,
    Stop: Stop_1.default,
};
