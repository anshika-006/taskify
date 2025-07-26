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
exports.verifyFirebaseToken = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
// if (!getApps().length) {
//   initializeApp({
//   credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!))
// });
// }
const firebase_service_account_json_1 = __importDefault(require("../firebase-service-account.json")); // <-- works in dev if resolveJsonModule is true
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // in production (Render or any CI/CD)
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
}
else {
    // in development (local)
    serviceAccount = firebase_service_account_json_1.default;
}
if (!(0, app_1.getApps)().length) {
    (0, app_1.initializeApp)({
        credential: (0, app_1.cert)(serviceAccount),
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
