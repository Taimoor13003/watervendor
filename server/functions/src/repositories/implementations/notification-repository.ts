
import { Notification } from "../../models/repomodels/notification";
import { INotificationRepository } from "../interfaces/inotification-repository";
import { Repository } from "./repository";
import { PrismaModel } from '../../enums/enums';

export class NotificationRepository extends Repository<Notification> implements INotificationRepository {
    public collectionName2: PrismaModel= PrismaModel.user;
     public collectionName = "notification"; 
    constructor() {
        super();
    }
}


