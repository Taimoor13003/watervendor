"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
class Notification {
    constructor() {
        this.id = "";
        this.createdOnDate = new Date().getTime();
        this.title = "";
        this.message = "";
        this.icon = "";
        this.topics = "";
        this.data = {};
        this.type = "asd";
    }
}
exports.Notification = Notification;
//# sourceMappingURL=notification.js.map