"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const enums_1 = require("../../enums/enums");
class User {
    constructor() {
        this.id = "";
        this.name = "";
        this.email = "";
        this.profilePicture = "";
        this.isEmailVerified = false;
        this.loginSource = enums_1.LoginSource.default;
        this.status = true;
        this.createdOnDate = new Date().getTime();
    }
}
exports.User = User;
//# sourceMappingURL=user.js.map