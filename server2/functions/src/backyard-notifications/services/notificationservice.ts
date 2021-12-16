import { FcmProvider } from "./fcmprovider";
import { DataService } from "./dataservice";
import { FirebaseConstants, ResponseCode, SuccessMessages, ErrorMessages } from "../constants";
import { INotificationModel } from "../dto/inotificationmodel";
import { IResponseModel } from "../dto/iresponsemodel";
import * as _ from "lodash";

export class PushNotificationService {


    readonly _CLASS_NAME = 'NotificationService';

    private localFcmProvider: FcmProvider;

    constructor(private dataService: DataService) {
        this.localFcmProvider = new FcmProvider(FirebaseConstants.ServerKey);
    }

    // sends notification to request.UserId or request.Topics
    async sendNotification(request: INotificationModel): Promise<IResponseModel<INotificationModel | undefined>> {

        const methodName = '.sendNotification(): ';

        console.log(this._CLASS_NAME + methodName + ' BEGIN');

        let result: IResponseModel<INotificationModel | undefined>;

        let recipients: string[] = [];
        let responseCode: string = '';
        let isTopic: boolean = false;

        if (request.UserId) {
            // Request has User Id
            // Notifications will be sent to user devices, if any
            console.log('-------------' + request.UserId + '-------------');
            var user = await this.dataService.getUser(request.UserId);
            if (user && user.Devices && user.Devices.length > 0) {
                console.log(user,"UUUUUUUUSEEERRRRR")
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
                } catch (error) {
                    response = error; 
                    console.error(this._CLASS_NAME + methodName + 'this.localFcmProvider.pushMessage() error: ' + error)
                }
                responseCode = responseCode == ResponseCode.Success ? responseCode : response;
            });
            await Promise.all(promises);
            const isSuccess: boolean = responseCode === ResponseCode.Success;

            if (isSuccess) {
                result = {
                    IsSuccess: true,
                    Message: SuccessMessages.MessageSent,
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
                Errors: [ErrorMessages.NoValidRecipients],
                Data: request
            };
        }
        return result;
    }
}