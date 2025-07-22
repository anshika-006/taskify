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
const db_1 = require("../db");
const middleware_1 = require("../middleware");
const router = express_1.default.Router();
router.post('/create', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bodySchema = zod_1.z.object({
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().email(),
        avatar: zod_1.z.string().optional()
    });
    const { success, data } = bodySchema.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            msg: "incorrect format"
        });
    }
    try {
        const existingUser = yield db_1.USER.findOne({ firebaseUid: req.userId });
        if (existingUser) {
            return res.status(409).json({
                msg: "User already exists",
                user: existingUser
            });
        }
        const newUser = new db_1.USER({
            firebaseUid: req.userId,
            name: data.name || '',
            email: data.email,
            avatar: data.avatar || ''
        });
        yield newUser.save();
        res.status(201).json({
            msg: "User created successfully",
            user: newUser
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({
            msg: "Error creating user"
        });
    }
}));
const updateBody = zod_1.z.object({
    name: zod_1.z.string().optional(),
    avatar: zod_1.z.string().optional()
});
router.put('/update', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = updateBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            msg: "incorrect format"
        });
    }
    try {
        yield db_1.USER.updateOne({ firebaseUid: req.userId }, {
            $set: Object.assign(Object.assign({}, (req.body.name && { name: req.body.name })), (req.body.avatar && { avatar: req.body.avatar }))
        });
        res.status(200).json({
            msg: "Updated"
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({
            msg: "Error updating user"
        });
    }
}));
router.get('/userInfo', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield db_1.USER.findOne({ firebaseUid: req.userId });
        if (!response) {
            return res.status(404).json({
                msg: "User not found"
            });
        }
        res.status(200).json({
            user: response
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            msg: "can't get details"
        });
    }
}));
router.put('/updateAvatar', middleware_1.verifyFirebaseToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { avatar } = req.body;
        yield db_1.USER.findOneAndUpdate({ firebaseUid: req.userId }, { avatar });
        res.status(200).json({ msg: "Avatar updated successfully" });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Failed to update avatar" });
    }
}));
exports.default = router;
