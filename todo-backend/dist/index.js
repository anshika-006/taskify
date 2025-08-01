"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// app.use(cors({
//   origin: 'https://anshika.vaamsolution.com',
//   credentials: true,
// }));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/v1', routes_1.default);
app.listen(3000);
