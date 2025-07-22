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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFirebaseToken = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
if (!(0, app_1.getApps)().length) {
    (0, app_1.initializeApp)({
        credential: (0, app_1.cert)('./firebase-service-account.json')
    });
}
const verifyFirebaseToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'No token provided or invalid format. Expected: Bearer <token>'
            });
        }
        const token = authHeader.split(' ')[1];
        const decodedToken = yield (0, auth_1.getAuth)().verifyIdToken(token);
        req.userId = decodedToken.uid;
        req.user = decodedToken;
        next();
    }
    catch (error) {
        console.error('Token verification error:', error);
        if ((error === null || error === void 0 ? void 0 : error.code) === 'auth/id-token-expired') {
            return res.status(401).json({ message: 'Token has expired' });
        }
        if ((error === null || error === void 0 ? void 0 : error.code) === 'auth/argument-error') {
            return res.status(401).json({ message: 'Invalid token format' });
        }
        return res.status(401).json({
            message: 'Invalid token',
            error: (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'
        });
    }
});
exports.verifyFirebaseToken = verifyFirebaseToken;
