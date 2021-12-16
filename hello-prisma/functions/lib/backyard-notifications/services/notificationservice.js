"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationService = void 0;
const fcmprovider_1 = require("./fcmprovider");
const constants_1 = require("../constants");
const _ = require("lodash");
class PushNotificationService {
    constructor(dataService) {
        this.dataService = dataService;
        this._CLASS_NAME = 'NotificationService';
        this.localFcmProvider = new fcmprovider_1.FcmProvider(constants_1.FirebaseConstants.ServerKey);
    }
    // sends notification to request.UserId or request.Topics
    async sendNotification(request) {
        const methodName = '.sendNotification(): ';
        console.log(this._CLASS_NAME + methodName + ' BEGIN');
        let result;
        let recipients = [];
        let responseCode = '';
        let isTopic = false;
        if (request.UserId) {
            // Request has User Id
            // Notifications will be sent to user devices, if any
            console.log('-------------' + request.UserId + '-------------');
            var user = await this.dataService.getUser(request.UserId);
            if (user && user.Devices && user.Devices.length > 0) {
                console.log(user, "UUUUUUUUSEEERRRRR");
                recipients = user.Devices.map(x => x.DeviceId);
            }
            else {
                console.error(this._CLASS_NAME + methodName + ' Either user or user devices not found for UserId: ' + request.UserId);
            }
        }
        else {
            console.log(this._CLASS_NAME + methodName + 'User Id not provided, notification will be sent to topics: ' + JSON.stringify(request.Topics));
            recipients = request.Topics.map(x => '/topics/' + x);
            // isTopic = true;
        }
        recipients = _.uniq(recipients);
        if (recipients && recipients.length > 0) {
            const promises = recipients.map(async (recipient) => {
                try {
                    var response = await this.localFcmProvider.pushMessage(recipient, request.Notification, isTopic);
                }
                catch (error) {
                    response = error;
                    console.error(this._CLASS_NAME + methodName + 'this.localFcmProvider.pushMessage() error: ' + error);
                }
                responseCode = responseCode == constants_1.ResponseCode.Success ? responseCode : response;
            });
            await Promise.all(promises);
            const isSuccess = responseCode === constants_1.ResponseCode.Success;
            if (isSuccess) {
                result = {
                    IsSuccess: true,
                    Message: constants_1.SuccessMessages.MessageSent,
                    Errors: [],
                    Data: request
                };
            }
            else {
                result = {
                    IsSuccess: false,
                    Message: responseCode,
                    Errors: [responseCode],
                    Data: request
                };
            }
        }
        else {
            result = {
                IsSuccess: false,
                Message: '',
                Errors: [constants_1.ErrorMessages.NoValidRecipients],
                Data: request
            };
        }
        return result;
    }
}
exports.PushNotificationService = PushNotificationService;
//# sourceMappingURL=notificationservice.js.map