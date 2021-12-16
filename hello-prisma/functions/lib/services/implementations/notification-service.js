"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const inversify_1 = require("inversify");
const identifiers_1 = require("../../identifiers");
const responsemodel_1 = require("../../models/dtos/responsemodel");
const notification_1 = require("../../models/repomodels/notification");
const notificationservice_1 = require("../../backyard-notifications/services/notificationservice");
const dataservice_1 = require("../../backyard-notifications/services/dataservice");
let NotificationService = class NotificationService {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
        this.dataService = new dataservice_1.DataService();
        this.notificationService = new notificationservice_1.PushNotificationService(this.dataService);
    }
    async addnotification(addNotification) {
        let response = new responsemodel_1.ResponseModel();
        if (!addNotification || addNotification == undefined || addNotification.id == "") {
            response.setError("cannot find Notification Data ", true);
        }
        let newNotification = new notification_1.Notification();
        try {
            newNotification = Object.assign(newNotification, addNotification);
            newNotification.createdOnDate = new Date().getTime();
            let result = await this.notificationRepository.add(newNotification);
            let updatedResult = await this.notificationRepository.update(result);
            response.setSuccessAndData(updatedResult, "Notification Added");
        }
        catch (error) {
            response.setServerError(error);
        }
        return response;
    }
    async getnotification(id) {
        let response = new responsemodel_1.ResponseModel();
        try {
            let notificationData = await this.notificationRepository.get(id);
            if (!notificationData || notificationData == undefined) {
                response.setError("cannot find notification", true);
            }
            else {
                let newNotification = new notification_1.Notification();
                newNotification = Object.assign(newNotification, notificationData);
                response.setSuccessAndData(newNotification, '');
            }
        }
        catch (err) {
            response.setServerError(err);
        }
        return response;
    }
    async deltePost(id) {
        let response = new responsemodel_1.ResponseModel();
        try {
            let delnotification = await this.notificationRepository.delete(id);
            response.setSuccessAndData(delnotification, "");
        }
        catch (err) {
            response.setServerError(err.message);
        }
        return response;
    }
    async sendPushNotification(data) {
        console.log("PUSH NOTIFICATION USERID", data["UserId"]);
        await this.notificationService.sendNotification(data);
    }
};
NotificationService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(identifiers_1.default.NotificationRepository))
], NotificationService);
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification-service.js.map