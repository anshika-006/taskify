"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../middleware");
const db_1 = require("../db");
const zod_1 = __importDefault(require("zod"));
const router = express_1.default.Router();
router.get('/allBoards', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const templateBoards = yield db_1.BOARD.find({ isTemplate: true });
        const userBoards = yield db_1.BOARD.find({
            userId: req.userId,
            isTemplate: false
        });
        res.status(200).json({
            templateBoards: templateBoards,
            userBoards: userBoards
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            msg: "some issue"
        });
    }
}));
const board = zod_1.default.object({
    name: zod_1.default.string(),
    colorTheme: zod_1.default.enum(['purple', 'blue', 'green', 'orange', 'red', 'pink', 'teal']).default('purple')
});
const getDefaultColumns = (colorTheme) => {
    const columnsByTheme = {
        purple: [
            { id: 'todo', name: 'To Do', order: 1 },
            { id: 'inprogress', name: 'In Progress', order: 2 },
            { id: 'underreview', name: 'Under Review', order: 3 },
            { id: 'finished', name: 'Finished', order: 4 }
        ],
        blue: [
            { id: 'todo', name: 'To Do', order: 1 },
            { id: 'inprogress', name: 'In Progress', order: 2 },
            { id: 'onhold', name: 'On Hold', order: 3 },
            { id: 'completed', name: 'Completed', order: 4 }
        ],
        green: [
            { id: 'backlog', name: 'Backlog', order: 1 },
            { id: 'development', name: 'Development', order: 2 },
            { id: 'testing', name: 'Testing', order: 3 },
            { id: 'deployed', name: 'Deployed', order: 4 }
        ],
        orange: [
            { id: 'ideas', name: 'Ideas', order: 1 },
            { id: 'sketching', name: 'Sketching', order: 2 },
            { id: 'creating', name: 'Creating', order: 3 },
            { id: 'published', name: 'Published', order: 4 }
        ],
        red: [
            { id: 'need', name: 'Need', order: 1 },
            { id: 'researching', name: 'Researching', order: 2 },
            { id: 'cart', name: 'Cart', order: 3 },
            { id: 'purchased', name: 'Purchased', order: 4 }
        ],
        pink: [
            { id: 'shopping', name: 'Shopping', order: 1 },
            { id: 'cooking', name: 'Cooking', order: 2 },
            { id: 'cleaning', name: 'Cleaning', order: 3 },
            { id: 'done', name: 'Done', order: 4 }
        ],
        teal: [
            { id: 'goals', name: 'Goals', order: 1 },
            { id: 'training', name: 'Training', order: 2 },
            { id: 'recovery', name: 'Recovery', order: 3 },
            { id: 'achieved', name: 'Achieved', order: 4 }
        ]
    };
    return columnsByTheme[colorTheme] || columnsByTheme.purple;
};
router.post('/addBoard', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = board.safeParse(req.body);
    try {
        if (!success) {
            return res.status(403).json({
                msg: "incorrect form of credentials"
            });
        }
        const colorTheme = req.body.colorTheme || 'purple';
        const defaultColumns = getDefaultColumns(colorTheme);
        const newBoard = yield db_1.BOARD.create({
            name: req.body.name,
            colorTheme: colorTheme,
            columns: defaultColumns,
            userId: req.userId
        });
        res.status(200).json({
            board: newBoard
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            msg: "some error"
        });
    }
}));
router.get('/oneBoard/:id', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const board = yield db_1.BOARD.findOne({
            $or: [
                { userId: req.userId, _id: id },
                { isTemplate: true, _id: id }
            ]
        });
        if (!board) {
            return res.status(404).json({
                msg: "Board not found"
            });
        }
        res.status(200).json({
            board: board
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            msg: "some error"
        });
    }
}));
const updateBody = zod_1.default.object({
    name: zod_1.default.string()
});
router.put('/updateName/:id', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = updateBody.safeParse(req.body);
    try {
        if (!success) {
            return res.status(411).json({
                msg: "incorrect form for name"
            });
        }
        const updatedBoard = yield db_1.BOARD.findOneAndUpdate({
            _id: req.params.id,
            userId: req.userId
        }, { $set: { name: req.body.name } }, { new: true });
        if (!updatedBoard) {
            return res.status(404).json({
                msg: "Board not found or unauthorized"
            });
        }
        res.status(200).json({
            board: updatedBoard
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            msg: "some error"
        });
    }
}));
router.delete('/delete/:id', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const board = yield db_1.BOARD.findOne({
            _id: req.params.id,
            userId: req.userId
        });
        if (!board) {
            return res.status(404).json({
                msg: "Board not found or unauthorized"
            });
        }
        const todoDeleteResult = yield db_1.TODO.deleteMany({
            boardId: req.params.id
        });
        const boardDeleteResult = yield db_1.BOARD.deleteOne({
            _id: req.params.id,
            userId: req.userId
        });
        res.status(200).json({
            msg: "Board and associated todos deleted successfully",
            deletedBoard: boardDeleteResult.deletedCount,
            deletedTodos: todoDeleteResult.deletedCount
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            msg: "some error"
        });
    }
}));
router.post('/createFromTemplate/:templateId', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const template = yield db_1.BOARD.findOne({
            _id: req.params.templateId,
            isTemplate: true
        });
        if (!template) {
            return res.status(404).json({
                msg: "template not found"
            });
        }
        const newBoard = yield db_1.BOARD.create({
            name: template.name,
            colorTheme: template.colorTheme,
            columns: template.columns,
            isTemplate: false,
            userId: req.userId
        });
        res.status(200).json({
            board: newBoard
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            msg: "some error"
        });
    }
}));
router.put('/updateAccess/:id', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedBoard = yield db_1.BOARD.findOneAndUpdate({
            _id: req.params.id,
            userId: req.userId
        }, {
            $set: {
                lastAccessed: new Date()
            },
            $inc: {
                accessCount: 1
            }
        }, {
            new: true
        });
        if (!updatedBoard) {
            return res.status(404).json({
                msg: "Board not found"
            });
        }
        res.status(200).json({
            board: updatedBoard
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            msg: "some error"
        });
    }
}));
router.get('/stats/:id', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const board = yield db_1.BOARD.findOne({
            _id: req.params.id,
            userId: req.userId
        });
        if (!board) {
            return res.status(404).json({
                msg: "Board not found"
            });
        }
        const todos = yield db_1.TODO.find({
            boardId: req.params.id,
            userId: req.userId
        });
        const columnStats = board.columns.map(column => {
            const columnTodos = todos.filter(todo => todo.columnId === column.id);
            return {
                columnId: column.id,
                columnName: column.name,
                taskCount: columnTodos.length,
                tasks: columnTodos
            };
        });
        const totalTasks = todos.length;
        const completedTasks = todos.filter(todo => todo.columnId === 'finished' ||
            todo.columnId === 'completed' ||
            todo.columnId === 'done' ||
            todo.columnId === 'deployed' ||
            todo.columnId === 'published' ||
            todo.columnId === 'purchased' ||
            todo.columnId === 'achieved').length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        res.status(200).json({
            stats: {
                totalTasks,
                completedTasks,
                completionRate,
                columnStats
            }
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            msg: "some error"
        });
    }
}));
exports.default = router;
