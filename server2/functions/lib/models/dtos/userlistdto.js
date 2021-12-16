"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserListDTO = void 0;
class UserListDTO {
    constructor() {
        this.id = "";
        this.firstName = "";
        this.lastName = "";
        this.fullName = "";
        this.userName = "";
        this.profilePicture = "";
        this.createdOnDate = new Date().getTime();
        // coordinate: object=[];
    }
}
exports.UserListDTO = UserListDTO;
//# sourceMappingURL=userlistdto.js.map