"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("./user"));
const todo_1 = __importDefault(require("./todo"));
const board_1 = __importDefault(require("./board"));
const router = express_1.default.Router();
router.use('/user', user_1.default);
router.use('/todo', todo_1.default);
router.use('/board', board_1.default);
exports.default = router;
