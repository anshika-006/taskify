import express from "express";
import { verifyFirebaseToken, AuthenticatedRequest } from '../middleware'
import { BOARD, TODO } from "../db";
import z, { safeParse } from "zod";


const router = express.Router()

router.get('/allBoards',  verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
        const templateBoards = await BOARD.find({ isTemplate: true })

        const userBoards = await BOARD.find({
            userId: req.userId,
            isTemplate: false
        })

        res.status(200).json({
            templateBoards: templateBoards,
            userBoards: userBoards
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: "some issue"
        })
    }
})

const board = z.object({
    name: z.string(),
    colorTheme: z.enum(['purple', 'blue', 'green', 'orange', 'red', 'pink', 'teal']).default('purple')
})

const getDefaultColumns = (colorTheme: string) => {
    const columnsByTheme: { [key: string]: { id: string; name: string; order: number; }[] } = {
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
    }
    return columnsByTheme[colorTheme] || columnsByTheme.purple
}

router.post('/addBoard',  verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    const { success } = board.safeParse(req.body)
    try {
        if (!success) {
            return res.status(403).json({
                msg: "incorrect form of credentials"
            })
        }

        const colorTheme = req.body.colorTheme || 'purple'
        const defaultColumns = getDefaultColumns(colorTheme)

        const newBoard = await BOARD.create({
            name: req.body.name,
            colorTheme: colorTheme,
            columns: defaultColumns,
            userId: req.userId
        })
        res.status(200).json({
            board: newBoard
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: "some error"
        })
    }
})

router.get('/oneBoard/:id',  verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    const id = req.params.id
    try {
        const board = await BOARD.findOne({
            $or: [
                { userId: req.userId, _id: id },
                { isTemplate: true, _id: id }
            ]
        })
        if (!board) {
            return res.status(404).json({
                msg: "Board not found"
            })
        }
        res.status(200).json({
            board: board
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: "some error"
        })
    }
})

const updateBody = z.object({
    name: z.string()
})

router.put('/updateName/:id',  verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    const { success } = updateBody.safeParse(req.body)
    try {
        if (!success) {
            return res.status(411).json({
                msg: "incorrect form for name"
            })
        }
        const updatedBoard = await BOARD.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.userId
            },
            { $set: { name: req.body.name } },
            { new: true }
        )

        if (!updatedBoard) {
            return res.status(404).json({
                msg: "Board not found or unauthorized"
            })
        }
        res.status(200).json({
            board: updatedBoard
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: "some error"
        })
    }
})

router.delete('/delete/:id',  verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
        const board = await BOARD.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!board) {
            return res.status(404).json({
                msg: "Board not found or unauthorized"
            });
        }
        const todoDeleteResult = await TODO.deleteMany({
            boardId: req.params.id
        });
        const boardDeleteResult = await BOARD.deleteOne({
            _id: req.params.id,
            userId: req.userId
        });

        res.status(200).json({
            msg: "Board and associated todos deleted successfully",
            deletedBoard: boardDeleteResult.deletedCount,
            deletedTodos: todoDeleteResult.deletedCount
        });
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: "some error"
        })
    }
})

router.post('/createFromTemplate/:templateId',  verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
        const template = await BOARD.findOne({
            _id: req.params.templateId,
            isTemplate: true
        })
        if (!template) {
            return res.status(404).json({
                msg: "template not found"
            })
        }
        const newBoard = await BOARD.create({
            name: template.name,
            colorTheme: template.colorTheme,
            columns: template.columns,
            isTemplate: false,
            userId: req.userId
        })
        res.status(200).json({
            board: newBoard
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: "some error"
        })
    }
})

router.put('/updateAccess/:id',  verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
        const updatedBoard = await BOARD.findOneAndUpdate({
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
        })

        if (!updatedBoard) {
            return res.status(404).json({
                msg: "Board not found"
            })
        }
        res.status(200).json({
            board: updatedBoard
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: "some error"
        })
    }
})

router.get('/stats/:id',  verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
        const board = await BOARD.findOne({
            _id: req.params.id,
            userId: req.userId
        })

        if (!board) {
            return res.status(404).json({
                msg: "Board not found"
            })
        }

        const todos = await TODO.find({
            boardId: req.params.id,
            userId: req.userId
        })

        const columnStats = board.columns.map(column => {
            const columnTodos = todos.filter(todo => todo.columnId === column.id)
            return {
                columnId: column.id,
                columnName: column.name,
                taskCount: columnTodos.length,
                tasks: columnTodos
            }
        })

        const totalTasks = todos.length
        const completedTasks = todos.filter(todo =>
            todo.columnId === 'finished' ||
            todo.columnId === 'completed' ||
            todo.columnId === 'done' ||
            todo.columnId === 'deployed' ||
            todo.columnId === 'published' ||
            todo.columnId === 'purchased' ||
            todo.columnId === 'achieved'
        ).length

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

        res.status(200).json({
            stats: {
                totalTasks,
                completedTasks,
                completionRate,
                columnStats
            }
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            msg: "some error"
        })
    }
})



export default router