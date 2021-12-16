"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotificationService = void 0;
const dataservice_1 = require("./dataservice");
const fcmprovider_1 = require("./fcmprovider");
const constants_1 = require("../constants");
const _ = require("lodash");
class UserNotificationService {
    constructor() {
        this._CLASS_NAME = 'UserService';
        this.dataService = new dataservice_1.DataService();
        this.fcmProvider = new fcmprovider_1.FcmProvider(constants_1.FirebaseConstants.ServerKey);
    }
    // Adds device to user
    // Creates new user if doesn't exist
    async subscribeDevice(request) {
        console.log("SUBSCRIPTION OBJECT", JSON.stringify(request));
        const methodName = 'subscribeDevice';
        const device = {
            DeviceId: request.DeviceId,
            Type: request.Type
        };
        const user = {
            Id: request.UserId,
            Devices: [device],
            Topics: []
        };
        let result;
        const existingUser = await this.dataService.getUser(request.UserId);
        if (existingUser) {
            // User Already exists
            console.log(this._CLASS_NAME + '.' + methodName + ' user.Id ' + request.UserId + '| Already exists.');
            if (!existingUser.Devices) {
                existingUser.Devices = [];
            }
            if (_.find(existingUser.Devices, x => x.DeviceId == request.DeviceId)) {
                // User already has requested device
                result = {
                    IsSuccess: true,
                    Message: constants_1.SuccessMessages.UserAdded,
                    Errors: [],
                    Data: existingUser
                };
            }
            else {
                console.log(this._CLASS_NAME + methodName + ' Adding new device to UserId: ' + request.UserId);
                if (existingUser.Topics && existingUser.Topics.length > 0) {
                    const promises = existingUser.Topics.map(async (topic) => {
                        if (request.DeviceId != undefined) {
                            await this.fcmProvider.subscribeToTopic(request.DeviceId, topic);
                        }
                    });
                    await Promise.all(promises);
                }
                existingUser.Devices.push(device);
                return await this.dataService.setUser(existingUser);
            }
            return result;
        }
        else {
            let data = await this.dataService.setUser(user);
            console.log(JSON.stringify(data));
            return data;
        }
    }
    // Removes user device 
    // Unsubscribe instance id for user
    async unsubscribeDevice(request) {
        const methodName = 'unsubscribeDevice';
        let user = await this.dataService.getUser(request.UserId);
        let result;
        if (user) {
            _.remove(user.Devices, x => x.DeviceId === request.DeviceId);
            // TODO: Unsubscribe device from FCM
            await this.fcmProvider.unsubscribeDevice(request.DeviceId);
            return await this.dataService.setUser(user);
        }
        else {
            console.log(this._CLASS_NAME + '.' + methodName + ': USER NOT FOUND - UserID: ' + request.UserId);
            result = {
                IsSuccess: false,
                Message: '',
                Errors: [constants_1.ErrorMessages.UserNotFound],
                Data: undefined
            };
            return result;
        }
    }
    // Adds user devices to topic
    async subscribeTopic(request) {
        const methodName = 'subscribeTopic';
        const topic = request.Topic;
        let result;
        const user = await this.dataService.getUser(request.UserId);
        if (user) {
            // User Found
            console.log(this._CLASS_NAME + '.' + methodName + ' user.Id ' + request.UserId + '| User found.');
            user.Topics = user.Topics ? user.Topics : [];
            if (!_.find(user.Topics, x => x === request.Topic)) {
                user.Topics.push(topic);
            }
            if (user.Devices && user.Devices.length > 0) {
                const promises = user.Devices.map(async (device) => {
                    await this.fcmProvider.subscribeToTopic(device.DeviceId, request.Topic);
                });
                await Promise.all(promises);
                return this.dataService.setUser(user);
            }
            else {
                result = {
                    IsSuccess: false,
                    Message: '',
                    Errors: [constants_1.ErrorMessages.NoDeviceFound],
                    Data: undefined
                };
                return result;
            }
        }
        else {
            result = {
                IsSuccess: false,
                Message: '',
                Errors: [constants_1.ErrorMessages.UserNotFound],
                Data: undefined
            };
            return result;
        }
    }
    // Unsubscribe user devices to topic
    async unsubscribeTopic(request) {
        const methodName = 'unsubscribeTopic';
        let result;
        const user = await this.dataService.getUser(request.UserId);
        if (user) {
            // User Found
            console.log(this._CLASS_NAME + '.' + methodName + ' user.Id ' + request.UserId + '| User found.');
            _.remove(user.Topics, x => x === request.Topic);
            if (user.Devices && user.Devices.length > 0) {
                const promises = user.Devices.map(async (device) => {
                    await this.fcmProvider.unsubscribeToTopic(device.DeviceId, request.Topic);
                });
                await Promise.all(promises);
            }
            return this.dataService.setUser(user);
        }
        else {
            result = {
                IsSuccess: false,
                Message: '',
                Errors: [constants_1.ErrorMessages.UserNotFound],
                Data: undefined
            };
            return result;
        }
    }
}
exports.UserNotificationService = UserNotificationService;
//# sourceMappingURL=usernotificationservice.js.map