"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TODO = exports.BOARD = exports.USER = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connect("mongodb+srv://anshikajainqsp:ckkrh8sdR7qBI5YB@cluster0.avhw6iw.mongodb.net/todo-full");
const schema = mongoose_1.default.Schema;
const model = mongoose_1.default.model;
const objectid = schema.Types.ObjectId;
const user = new schema({
    firebaseUid: { type: String, unique: true, required: true },
    email: { type: String, required: true },
    name: { type: String, default: '' },
    avatar: { type: String,
        default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neutral&backgroundColor=ffdfbf&skinColor=fdbcb4&hairColor=724133&clothingColor=262e33&topType=shortHairShortFlat&clothingType=shirt&eyeType=default&mouthType=default&facialHairType=blank',
    },
    createdAt: { type: Date, default: Date.now }
});
const board = new schema({
    name: { type: String, required: true },
    colorTheme: {
        type: String,
        default: 'purple',
        enum: ['purple', 'blue', 'green', 'orange', 'red', 'pink', 'teal']
    },
    columns: [{
            id: { type: String, required: true },
            name: { type: String, required: true },
            order: { type: Number, required: true }
        }],
    isTemplate: { type: Boolean, default: false },
    lastAccessed: { type: Date, default: Date.now },
    accessCount: { type: Number, default: 0 },
    userId: { type: String, required: true }
});
const todo = new schema({
    title: { type: String, required: true },
    description: String,
    priority: String,
    time: Date,
    type: String,
    status: String,
    columnId: { type: String, required: true },
    position: { type: Number, default: 0 },
    boardId: { type: objectid, ref: 'board', required: true },
    userId: { type: String, required: true }
});
exports.USER = model('user', user);
exports.BOARD = model('board', board);
exports.TODO = model('todo', todo);
