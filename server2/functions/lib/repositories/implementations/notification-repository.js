"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const repository_1 = require("./repository");
class NotificationRepository extends repository_1.Repository {
    constructor() {
        super();
        this.collectionName = "notification";
    }
}
exports.NotificationRepository = NotificationRepository;
//# sourceMappingURL=notification-repository.js.map