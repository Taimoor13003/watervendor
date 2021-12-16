"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDTO = void 0;
const enums_1 = require("../../enums/enums");
class UserDTO {
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
exports.UserDTO = UserDTO;
//# sourceMappingURL=userdto.js.map