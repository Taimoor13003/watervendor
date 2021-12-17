import { DataService } from "./dataservice";
import { FcmProvider } from "./fcmprovider";
import { FirebaseConstants, SuccessMessages, ErrorMessages } from "../constants";
import { IAddDeviceRequestModel } from "../dto/iadddevicerequestmodel";
import { IResponseModel } from "../dto/iresponsemodel";
import { IUser } from "../dto/iuser";
import { IDevice } from "../dto/IDevice";
import { IRemoveDeviceRequestModel } from "../dto/iremovedevicemodel";
import { ITopicRequestModel } from "../dto/itopicrequestmodel";
import * as _ from "lodash";
export class UserNotificationService {

    readonly _CLASS_NAME: string = 'UserService';

    private dataService: DataService;
    private fcmProvider: FcmProvider;

    constructor() {
        this.dataService = new DataService();
        this.fcmProvider = new FcmProvider(FirebaseConstants.ServerKey);
    }

    // Adds device to user
    // Creates new user if doesn't exist
    async subscribeDevice(request: IAddDeviceRequestModel): Promise<IResponseModel<IUser>> {
        console.log("SUBSCRIPTION OBJECT",JSON.stringify(request));
        const methodName: string = 'subscribeDevice';

        const device: IDevice = {
            DeviceId: request.DeviceId,
            Type: request.Type
        };

        const user: IUser = {
            Id: request.UserId,
            Devices: [device],
            Topics: []
        }

        let result: IResponseModel<IUser>;

        const existingUser: IUser | undefined = await this.dataService.getUser(request.UserId);

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
                    Message: SuccessMessages.UserAdded,
                    Errors: [],
                    Data: existingUser
                };
            }
            else {
                console.log(this._CLASS_NAME + methodName + ' Adding new device to UserId: ' + request.UserId);
                if (existingUser.Topics && existingUser.Topics.length > 0) {
                    const promises = existingUser.Topics.map(async (topic) => {
                        if(request.DeviceId!=undefined){
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
        else{
            let data:any=await this.dataService.setUser(user);
            console.log(JSON.stringify(data));
            return data;
        }
    }

    // Removes user device 
    // Unsubscribe instance id for user
    async unsubscribeDevice(request: IRemoveDeviceRequestModel): Promise<IResponseModel<IUser | undefined>> { 
        const methodName: string = 'unsubscribeDevice';

        let user = await this.dataService.getUser(request.UserId); 

        let result: IResponseModel<IUser | undefined>;

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
                Errors: [ErrorMessages.UserNotFound],
                Data: undefined
            }
            return result;
        }
    }

    // Adds user devices to topic
    async subscribeTopic(request: ITopicRequestModel): Promise<IResponseModel<IUser | undefined>> {

        const methodName: string = 'subscribeTopic';

        const topic = request.Topic;

        let result: IResponseModel<IUser | undefined>;

        const user: IUser | undefined = await this.dataService.getUser(request.UserId);

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
                    Errors: [ErrorMessages.NoDeviceFound],
                    Data: undefined
                }
                return result;
            }
        }
        else {
            result = {
                IsSuccess: false,
                Message: '',
                Errors: [ErrorMessages.UserNotFound],
                Data: undefined
            }
            return result;
        }
    }

    // Unsubscribe user devices to topic
    async unsubscribeTopic(request: ITopicRequestModel): Promise<IResponseModel<IUser | undefined>> {

        const methodName: string = 'unsubscribeTopic';

        let result: IResponseModel<IUser | undefined>;

        const user: IUser | undefined = await this.dataService.getUser(request.UserId);

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
                Errors: [ErrorMessages.UserNotFound],
                Data: undefined
            }
            return result;
        }
    }
}