import express from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt'
import { USER } from '../db'

import {  verifyFirebaseToken, AuthenticatedRequest } from '../middleware';

const router = express.Router()

router.post('/create', verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    const bodySchema = z.object({
        name: z.string().optional(),
        email: z.string().email(),
        avatar: z.string().optional()
    });

    const { success, data } = bodySchema.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            msg: "incorrect format"
        });
    }

    try {
        const existingUser = await USER.findOne({ firebaseUid: req.userId });
        if (existingUser) {
            return res.status(409).json({
                msg: "User already exists",
                user: existingUser
            });
        }

        const newUser = new USER({
            firebaseUid: req.userId, 
            name: data.name || '',
            email: data.email,
            avatar: data.avatar || ''
        });

        await newUser.save();

        res.status(201).json({
            msg: "User created successfully",
            user: newUser
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            msg: "Error creating user"
        });
    }
});

const updateBody = z.object({
    name: z.string().optional(),
    avatar: z.string().optional()
});

router.put('/update', verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    const { success } = updateBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            msg: "incorrect format"
        });
    }

    try {
        await USER.updateOne(
            { firebaseUid: req.userId }, 
            {
                $set: {
                    ...(req.body.name && { name: req.body.name }),
                    ...(req.body.avatar && { avatar: req.body.avatar })
                }
            }
        );

        res.status(200).json({
            msg: "Updated"
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            msg: "Error updating user"
        });
    }
});

router.get('/userInfo', verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
        const response = await USER.findOne({ firebaseUid: req.userId }); 

        if (!response) {
            return res.status(404).json({
                msg: "User not found"
            });
        }

        res.status(200).json({
            user: response
        });
        
    } catch (e) {
        console.log(e);
        res.status(500).json({
            msg: "can't get details"
        });
    }
});

router.put('/updateAvatar', verifyFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
        const { avatar } = req.body;
        await USER.findOneAndUpdate(
            { firebaseUid: req.userId },
            { avatar }
        );
        res.status(200).json({ msg: "Avatar updated successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Failed to update avatar" });
    }
});


export default router