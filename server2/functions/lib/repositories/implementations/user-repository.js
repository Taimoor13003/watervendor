"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const repository_1 = require("./repository");
class UserRepository extends repository_1.Repository {
    constructor() {
        super();
        this.collectionName = "users";
    }
}
exports.UserRepository = UserRepository;
1;
//# sourceMappingURL=user-repository.js.map