"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataService = void 0;
const admin = require("firebase-admin");
const constants_1 = require("../constants");
class DataService {
    constructor() {
        this._CLASS_NAME = 'DataService';
        this.db = admin.firestore();
        this.users = this.db.collection('notificationusers');
    }
    // Sets IUser for IUser.Id
    async setUser(user) {
        const methodName = 'setUser():';
        console.log(JSON.stringify(user));
        let result;
        try {
            const ref = await this.users.doc(user.Id).set(user);
            console.log('UserId: ' + user.Id + ' | Result: ' + JSON.stringify(ref));
            result = {
                IsSuccess: true,
                Message: constants_1.SuccessMessages.UserAdded,
                Errors: [],
                Data: user
            };
            console.log(JSON.stringify(result));
            return result;
        }
        catch (error) {
            console.log(this._CLASS_NAME + methodName + ' User add failed: ' + error);
            result = {
                IsSuccess: false,
                Message: constants_1.ErrorMessages.UserNotAdded,
                Errors: [constants_1.ErrorMessages.UserNotAdded],
                Data: user
            };
            return result;
        }
    }
    // Gets IUser for userId
    async getUser(userId) {
        try {
            const doc = await this.users.doc(userId).get();
            if (doc.exists) {
                const data = doc.data();
                if (data)
                    return {
                        Id: data.Id,
                        Devices: data.Devices,
                        Topics: data.Topics
                    };
            }
        }
        catch (error) {
            console.log(this._CLASS_NAME + '.getUser() failed. Error: ' + error);
            return Promise.reject(error);
        }
        return Promise.resolve(undefined);
    }
}
exports.DataService = DataService;
//# sourceMappingURL=dataservice.js.map