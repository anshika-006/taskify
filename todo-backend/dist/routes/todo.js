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
const zod_1 = require("zod");
const middleware_1 = require("../middleware");
const db_1 = require("../db");
const router = express_1.default.Router();
const todoBody = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    time: zod_1.z.preprocess((val) => {
        if (typeof val === "string" || val instanceof Date) {
            const parsed = new Date(val);
            if (!isNaN(parsed.getTime()))
                return parsed;
        }
        return undefined;
    }, zod_1.z.date()),
    type: zod_1.z.string(),
    priority: zod_1.z.string(),
    columnId: zod_1.z.string(),
    boardId: zod_1.z.string()
});
router.post('/add', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = todoBody.safeParse(req.body);
    try {
        if (!success) {
            return res.status(411).json({
                msg: "Incorrect format to add todo"
            });
        }
        const newTodo = yield db_1.TODO.create({
            title: req.body.title,
            description: req.body.description,
            type: req.body.type,
            time: req.body.time,
            priority: req.body.priority,
            columnId: req.body.columnId,
            boardId: req.body.boardId,
            position: 0,
            userId: req.userId
        });
        res.status(200).json({
            msg: "todo added",
            todo: newTodo
        });
    }
    catch (e) {
        res.status(500).json({
            msg: "todo can't be added"
        });
        console.log(e);
    }
}));
const todoUpdate = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    time: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    priority: zod_1.z.string().optional(),
    columnId: zod_1.z.string().optional(),
    position: zod_1.z.number().optional()
});
router.put('/update/:id', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = todoUpdate.safeParse(req.body);
    try {
        if (!success) {
            return res.status(411).json({
                msg: "trying to update with incompatible info"
            });
        }
        const updatedTodo = yield db_1.TODO.findOneAndUpdate({
            userId: req.userId,
            _id: req.params.id,
        }, {
            $set: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (req.body.title && { title: req.body.title })), (req.body.description && { description: req.body.description })), (req.body.type && { type: req.body.type })), (req.body.time && { time: req.body.time })), (req.body.priority && { priority: req.body.priority })), (req.body.columnId && { columnId: req.body.columnId })), (req.body.position !== undefined && { position: req.body.position }))
        }, { new: true });
        if (!updatedTodo) {
            return res.status(404).json({
                msg: "Todo not found"
            });
        }
        res.status(200).json({
            msg: "Info updated",
            todo: updatedTodo
        });
    }
    catch (e) {
        res.status(500).json({
            msg: "could not update"
        });
        console.log(e);
    }
}));
router.get('/board/:boardId/todos', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todos = yield db_1.TODO.find({
            userId: req.userId,
            boardId: req.params.boardId
        }).sort({ position: 1 });
        res.status(200).json({
            todos: todos
        });
    }
    catch (e) {
        res.status(500).json({
            msg: "couldn't fetch todos"
        });
    }
}));
const columnSchema = zod_1.z.object({
    columnId: zod_1.z.string(),
    position: zod_1.z.number().optional()
});
router.put('/updateColumn/:id', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = columnSchema.safeParse(req.body);
    if (!success) {
        return res.status(400).json({
            msg: "Invalid column value"
        });
    }
    try {
        const updateData = { columnId: req.body.columnId };
        if (req.body.position !== undefined) {
            updateData.position = req.body.position;
        }
        const updatedTodo = yield db_1.TODO.findOneAndUpdate({
            _id: req.params.id,
            userId: req.userId
        }, updateData, { new: true });
        if (!updatedTodo) {
            return res.status(404).json({
                msg: "Todo not found"
            });
        }
        res.status(200).json({
            msg: "todo updated",
            todo: updatedTodo
        });
    }
    catch (e) {
        res.status(500).json({
            msg: "couldn't update todo"
        });
    }
}));
router.delete('/delete/:id', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.TODO.deleteOne({
            userId: req.userId,
            _id: req.params.id
        });
        if (result.deletedCount === 0) {
            return res.status(404).json({
                msg: "Todo not found"
            });
        }
        res.status(200).json({
            msg: "todo deleted"
        });
    }
    catch (e) {
        res.status(500).json({
            msg: "Could not delete todo"
        });
        console.log(e);
    }
}));
const moveSchema = zod_1.z.object({
    newColumnId: zod_1.z.string(),
    newPosition: zod_1.z.number(),
    boardId: zod_1.z.string()
});
router.put('/move/:id', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = moveSchema.safeParse(req.body);
    if (!success) {
        return res.status(400).json({
            msg: "Invalid move data"
        });
    }
    try {
        const targetColumnTodos = yield db_1.TODO.find({
            userId: req.userId,
            boardId: req.body.boardId,
            columnId: req.body.newColumnId
        }).sort({ position: 1 });
        yield db_1.TODO.updateMany({
            userId: req.userId,
            boardId: req.body.boardId,
            columnId: req.body.newColumnId,
            position: { $gte: req.body.newPosition }
        }, { $inc: { position: 1 } });
        const movedTodo = yield db_1.TODO.findOneAndUpdate({
            _id: req.params.id,
            userId: req.userId
        }, {
            columnId: req.body.newColumnId,
            position: req.body.newPosition
        }, { new: true });
        if (!movedTodo) {
            return res.status(404).json({
                msg: "Todo not found"
            });
        }
        res.status(200).json({
            msg: "todo moved successfully",
            todo: movedTodo
        });
    }
    catch (e) {
        res.status(500).json({
            msg: "couldn't move todo"
        });
        console.log(e);
    }
}));
const reorderSchema = zod_1.z.object({
    todoUpdates: zod_1.z.array(zod_1.z.object({
        todoId: zod_1.z.string(),
        newPosition: zod_1.z.number()
    }))
});
router.put('/reorder', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = reorderSchema.safeParse(req.body);
    if (!success) {
        return res.status(400).json({
            msg: "Invalid reorder data"
        });
    }
    try {
        const updatePromises = req.body.todoUpdates.map((update) => db_1.TODO.findOneAndUpdate({
            _id: update.todoId,
            userId: req.userId
        }, { position: update.newPosition }, { new: true }));
        const updatedTodos = yield Promise.all(updatePromises);
        res.status(200).json({
            msg: "todos reordered successfully",
            todos: updatedTodos
        });
    }
    catch (e) {
        res.status(500).json({
            msg: "couldn't reorder todos"
        });
        console.log(e);
    }
}));
router.post('/search/:boardId', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchTerm = req.body.title;
        if (!searchTerm) {
            return res.status(400).json({ msg: "Search term is required." });
        }
        const response = yield db_1.TODO.find({
            title: { $regex: `^${searchTerm}`, $options: 'i' },
            userId: req.userId,
            boardId: req.params.boardId
        });
        res.status(200).json({
            todos: response
        });
    }
    catch (e) {
        res.status(500).json({
            msg: "Couldn't find todos"
        });
        console.log(e);
    }
}));
exports.default = router;
