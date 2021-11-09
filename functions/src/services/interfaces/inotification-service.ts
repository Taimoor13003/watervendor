import { ResponseModel } from "../../models/dtos/responsemodel";
import { Notification } from "../../models/repomodels/notification";

export interface INotificationService {
  addnotification(
    addNotification: Notification
  ): Promise<ResponseModel<Notification>>;
  deltePost(id: string): Promise<ResponseModel<boolean>>;
  getnotification(id: string): Promise<ResponseModel<Notification>>
  sendPushNotification(data:any):any;


}
