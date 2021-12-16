
import { Notification } from "../../models/repomodels/notification";
import { INotificationRepository } from "../interfaces/inotification-repository";
import { Repository } from "./repository";

export class NotificationRepository extends Repository<Notification> implements INotificationRepository {
    public collectionName = "notification"; 
    constructor() {
        super();
    }
}


