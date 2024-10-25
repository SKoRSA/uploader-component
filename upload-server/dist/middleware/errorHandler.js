"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const errorHandler = (err, req, res, next) => {
    console.error(err);
    if (http_errors_1.default.isHttpError(err)) {
        res.status(err.status).json({
            error: {
                message: err.message,
                status: err.status,
            },
        });
    }
    else {
        res.status(500).json({
            error: {
                message: "Internal Server Error",
                status: 500,
            },
        });
    }
};
exports.errorHandler = errorHandler;
