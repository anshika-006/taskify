import express from 'express';
import { z } from 'zod';
import { verifyFirebaseToken, AuthenticatedRequest } from '../middleware'
import { TODO } from '../db';
const router = express.Router()

const todoBody = z.object({
    title: z.string(),
    description: z.string(),
    time: z.preprocess((val) => {
        if (typeof val === "string" || val instanceof Date) {
            const parsed = new Date(val);
            if (!isNaN(parsed.getTime())) return parsed;
        }
        return undefined;
    }, z.date()),
    type: z.string(),
    priority: z.string(),
    columnId: z.string(),
    boardId: z.string()
})

router.post('/add', verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    const { success } = todoBody.safeParse(req.body)
    try {
        if (!success) {
            return res.status(411).json({
                msg: "Incorrect format to add todo"
            })
        }
        const newTodo = await TODO.create({
            title: req.body.title,
            description: req.body.description,
            type: req.body.type,
            time: req.body.time,
            priority: req.body.priority,
            columnId: req.body.columnId,
            boardId: req.body.boardId,
            position: 0,
            userId: req.userId
        })
        res.status(200).json({
            msg: "todo added",
            todo: newTodo
        })
    } catch (e) {
        res.status(500).json({
            msg: "todo can't be added"
        })
        console.log(e)
    }
})

const todoUpdate = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    time: z.string().optional(),
    type: z.string().optional(),
    priority: z.string().optional(),
    columnId: z.string().optional(),
    position: z.number().optional()
})

router.put('/update/:id', verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    const { success } = todoUpdate.safeParse(req.body)
    try {
        if (!success) {
            return res.status(411).json({
                msg: "trying to update with incompatible info"
            })
        }
        const updatedTodo = await TODO.findOneAndUpdate(
            {
                userId: req.userId,
                _id: req.params.id,
            },
            {
                $set: {
                    ...(req.body.title && { title: req.body.title }),
                    ...(req.body.description && { description: req.body.description }),
                    ...(req.body.type && { type: req.body.type }),
                    ...(req.body.time && { time: req.body.time }),
                    ...(req.body.priority && { priority: req.body.priority }),
                    ...(req.body.columnId && { columnId: req.body.columnId }),
                    ...(req.body.position !== undefined && { position: req.body.position })
                }
            },
            { new: true }
        )
        if (!updatedTodo) {
            return res.status(404).json({
                msg: "Todo not found"
            })
        }
        res.status(200).json({
            msg: "Info updated",
            todo: updatedTodo
        })
    } catch (e) {
        res.status(500).json({
            msg: "could not update"
        })
        console.log(e)
    }
})

router.get('/board/:boardId/todos', verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
        const todos = await TODO.find({
            userId: req.userId,
            boardId: req.params.boardId
        }).sort({ position: 1 })

        res.status(200).json({
            todos: todos
        })
    } catch (e) {
        res.status(500).json({
            msg: "couldn't fetch todos"
        })
    }
})

const columnSchema = z.object({
    columnId: z.string(),
    position: z.number().optional()
})

router.put('/updateColumn/:id', verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    const { success } = columnSchema.safeParse(req.body)
    if (!success) {
        return res.status(400).json({
            msg: "Invalid column value"
        })
    }
    try {
        const updateData: any = { columnId: req.body.columnId }
        if (req.body.position !== undefined) {
            updateData.position = req.body.position
        }

        const updatedTodo = await TODO.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.userId
            },
            updateData,
            { new: true }
        )

        if (!updatedTodo) {
            return res.status(404).json({
                msg: "Todo not found"
            })
        }
        res.status(200).json({
            msg: "todo updated",
            todo: updatedTodo
        })
    } catch (e) {
        res.status(500).json({
            msg: "couldn't update todo"
        })
    }
})

router.delete('/delete/:id', verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
        const result = await TODO.deleteOne({
            userId: req.userId,
            _id: req.params.id
        })

        if (result.deletedCount === 0) {
            return res.status(404).json({
                msg: "Todo not found"
            })
        }

        res.status(200).json({
            msg: "todo deleted"
        })
    } catch (e) {
        res.status(500).json({
            msg: "Could not delete todo"
        })
        console.log(e)
    }
})

const moveSchema = z.object({
    newColumnId: z.string(),
    newPosition: z.number(),
    boardId: z.string()
})

router.put('/move/:id', verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    const { success } = moveSchema.safeParse(req.body)
    if (!success) {
        return res.status(400).json({
            msg: "Invalid move data"
        })
    }

    try {
        const targetColumnTodos = await TODO.find({
            userId: req.userId,
            boardId: req.body.boardId,
            columnId: req.body.newColumnId
        }).sort({ position: 1 })

        await TODO.updateMany(
            {
                userId: req.userId,
                boardId: req.body.boardId,
                columnId: req.body.newColumnId,
                position: { $gte: req.body.newPosition }
            },
            { $inc: { position: 1 } }
        )

        const movedTodo = await TODO.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.userId
            },
            {
                columnId: req.body.newColumnId,
                position: req.body.newPosition
            },
            { new: true }
        )

        if (!movedTodo) {
            return res.status(404).json({
                msg: "Todo not found"
            })
        }

        res.status(200).json({
            msg: "todo moved successfully",
            todo: movedTodo
        })
    } catch (e) {
        res.status(500).json({
            msg: "couldn't move todo"
        })
        console.log(e)
    }
})

interface TodoUpdate {
    todoId: string;
    newPosition: number;
}
const reorderSchema = z.object({
    todoUpdates: z.array(z.object({
        todoId: z.string(),
        newPosition: z.number()
    }))
})


router.put('/reorder', verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    const { success } = reorderSchema.safeParse(req.body)
    if (!success) {
        return res.status(400).json({
            msg: "Invalid reorder data"
        })
    }

    try {
        const updatePromises = req.body.todoUpdates.map((update: { todoId: string; newPosition: number }) =>
            TODO.findOneAndUpdate(
                {
                    _id: update.todoId,
                    userId: req.userId
                },
                { position: update.newPosition },
                { new: true }
            )
        )

        const updatedTodos = await Promise.all(updatePromises)

        res.status(200).json({
            msg: "todos reordered successfully",
            todos: updatedTodos
        })
    } catch (e) {
        res.status(500).json({
            msg: "couldn't reorder todos"
        })
        console.log(e)
    }
})

export default router