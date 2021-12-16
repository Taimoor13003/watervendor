"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolve = void 0;
require("reflect-metadata");
const inversify_1 = require("inversify");
const identifiers_1 = require("./identifiers");
const user_service_1 = require("./services/implementations/user-service");
const user_repository_1 = require("./repositories/implementations/user-repository");
const authentication_service_1 = require("./services/implementations/authentication-service");
const notification_repository_1 = require("./repositories/implementations/notification-repository");
const notification_service_1 = require("./services/implementations/notification-service");
let container = new inversify_1.Container();
container
    .bind(identifiers_1.default.UserRepository)
    .to(user_repository_1.UserRepository);
container
    .bind(identifiers_1.default.UserService)
    .to(user_service_1.UserService);
container
    .bind(identifiers_1.default.AuthenticationService)
    .to(authentication_service_1.AuthenticationService);
container
    .bind(identifiers_1.default.NotificationService)
    .to(notification_service_1.NotificationService);
container
    .bind(identifiers_1.default.NotificationRepository)
    .to(notification_repository_1.NotificationRepository);
function resolve(type) {
    return container.get(type);
}
exports.resolve = resolve;
//# sourceMappingURL=DependencyManagement.js.map