"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FcmProvider = void 0;
const constants_1 = require("../constants");
const gcm = require("node-gcm");
const request = require("request-promise-native");
class FcmProvider {
    constructor(serverKey) {
        this.serverKey = serverKey;
        this._CLASS_NAME = 'FcmProvider';
        this.sender = new gcm.Sender(this.serverKey);
    }
    // Sends push message
    pushMessage(to, message, isTopic) {
        console.log(to, "TTTTTTTTTTTTTTTOOOOOOO");
        console.log(message, "MEEEESAAGEEE");
        let methodName = 'pushMessage';
        console.log(this._CLASS_NAME + '.' + methodName + ': Begin');
        const notifMessage = new gcm.Message({
            notification: {
                title: message.Title,
                body: message.Body,
                icon: message.Icon,
                sound: message.Sound,
                click_action: message.Action
            },
            data: message.Data
        });
        const recipients = isTopic ? { topic: to } : { to: to };
        console.log(this._CLASS_NAME + methodName + ' recipients: ' + JSON.stringify(recipients));
        return new Promise((resolve, reject) => {
            this.sender.sendNoRetry(notifMessage, recipients, (err, resJson) => {
                console.log(err, "EEEERRROOORRRR");
                if (err || resJson.success < 1) {
                    // Log Error Message
                    const errorMessage = resJson && resJson.results ? resJson.results.map(x => x.error).join(" | ") : err;
                    console.log(this._CLASS_NAME + '.' + methodName + 'Rejecting with error: ' + errorMessage);
                    reject(errorMessage);
                }
                else {
                    console.log(this._CLASS_NAME + '.' + methodName + ':Resolving with success... FCM Response: ' + JSON.stringify(resJson));
                    resolve(constants_1.ResponseCode.Success);
                }
            });
        });
    }
    async subscribeToTopic(deviceId, topic) {
        const methodName = '.subscribeToTopic(): ';
        try {
            const url = 'https://iid.googleapis.com/iid/v1/' + deviceId + '/rel/topics/' + topic;
            console.log(this._CLASS_NAME + methodName + 'subscribing topic: ' + url);
            await request.post(url, { headers: { 'Authorization': 'key=' + this.serverKey } });
            return true;
        }
        catch (error) {
            console.log(this._CLASS_NAME + methodName + ' DeviceId: ' + deviceId + ' Topic: ' + topic + ' error: ' + error);
        }
        return false;
    }
    async unsubscribeToTopic(deviceId, topic) {
        const methodName = '.unsubscribeToTopic(): ';
        try {
            const url = 'https://iid.googleapis.com/iid/v1/' + deviceId + '/rel/topics/' + topic;
            console.log(this._CLASS_NAME + methodName + 'unsubscribing topic: ' + url);
            await request.delete(url, { headers: { 'Authorization': 'key=' + this.serverKey } });
            return true;
        }
        catch (error) {
            console.log(this._CLASS_NAME + methodName + ' DeviceId: ' + deviceId + ' Topic: ' + topic + ' error: ' + error);
        }
        return false;
    }
    async unsubscribeDevice(deviceId) {
        const methodName = '.unsubscribeDevice(): ';
        try {
            const url = 'https://iid.googleapis.com/iid/' + deviceId;
            console.log(this._CLASS_NAME + methodName + 'unsubscribing Device: ' + url);
            await request.delete(url, { headers: { 'Authorization': 'key=' + this.serverKey } });
            return true;
        }
        catch (error) {
            console.log(this._CLASS_NAME + methodName + ' DeviceId: ' + deviceId + ' error: ' + error);
        }
        return false;
    }
}
exports.FcmProvider = FcmProvider;
//# sourceMappingURL=fcmprovider.js.map