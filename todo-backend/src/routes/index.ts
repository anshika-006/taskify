import express from 'express';
import userRoutes from './user';
import todoRoutes from './todo';
import boardRoutes from './board'

const router = express.Router();

router.use('/user', userRoutes);
router.use('/todo', todoRoutes);
router.use('/board',boardRoutes)

export default router;
