"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firestoreAutoId = void 0;
const firestoreAutoId = () => {
    const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let autoId = "";
    for (let i = 0; i < 20; i++) {
        autoId += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    return autoId;
};
exports.firestoreAutoId = firestoreAutoId;
//# sourceMappingURL=idGenerator.js.map