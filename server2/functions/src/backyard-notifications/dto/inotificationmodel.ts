import { IPushMessage } from "./ipushmessage";


export interface INotificationModel {
    Notification: IPushMessage,
    UserId: string,
    Topics: string[]
}