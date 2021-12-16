import admin = require("firebase-admin");
import { IUser } from "../dto/iuser";
import { IResponseModel } from "../dto/iresponsemodel";
import { SuccessMessages, ErrorMessages } from "../constants";



export class DataService {

    readonly _CLASS_NAME = 'DataService';
    private db: admin.firestore.Firestore;
    private users: admin.firestore.CollectionReference;

    constructor() {
        this.db = admin.firestore();
        this.users = this.db.collection('notificationusers');
    }

    // Sets IUser for IUser.Id
    async setUser(user: IUser) {

        const methodName = 'setUser():';
        console.log(JSON.stringify(user));
        let result: IResponseModel<IUser>;
        try {
            const ref = await this.users.doc(user.Id).set(user);
            console.log('UserId: ' + user.Id + ' | Result: ' + JSON.stringify(ref))
            result = {
                IsSuccess: true,
                Message: SuccessMessages.UserAdded,
                Errors: [],
                Data: user
            };
            console.log(JSON.stringify(result));
            return result;
        } catch (error) {
            console.log(this._CLASS_NAME + methodName + ' User add failed: ' + error);
            result = {
                IsSuccess: false,
                Message: ErrorMessages.UserNotAdded,
                Errors: [ErrorMessages.UserNotAdded],
                Data: user
            };
            return result;
        }
    }

    // Gets IUser for userId
    async getUser(userId: string): Promise<IUser | undefined> {
        try {
            const doc = await this.users.doc(userId).get();

            if (doc.exists) {
                const data: admin.firestore.DocumentData | undefined = doc.data();
                if (data)
                    return {
                        Id: data.Id,
                        Devices: data.Devices,
                        Topics: data.Topics
                    }
            }
        } catch (error) {
            console.log(this._CLASS_NAME + '.getUser() failed. Error: ' + error);
            return Promise.reject(error);
        }
        return Promise.resolve(undefined);
    }
}