import { inject, injectable } from "inversify";
import SERVICE_IDENTIFIER from "../../identifiers";
import { ResponseModel } from "../../models/dtos/responsemodel";
import { Notification } from "../../models/repomodels/notification";
import { INotificationRepository } from "../../repositories/interfaces/inotification-repository";
import { INotificationService } from "../interfaces/inotification-service";
import { PushNotificationService } from "../../backyard-notifications/services/notificationservice";
  import { DataService } from "../../backyard-notifications/services/dataservice";


@injectable()    
export class NotificationService implements INotificationService {
  private dataService: DataService = new DataService();
  private notificationService: PushNotificationService = new PushNotificationService(
    this.dataService
  );

  constructor(
    @inject(SERVICE_IDENTIFIER.NotificationRepository)
    private notificationRepository: INotificationRepository

    
  ) {}
  public async addnotification(
    addNotification: Notification
  ): Promise<ResponseModel<Notification>> {
    let response: ResponseModel<Notification> =
    new ResponseModel<Notification>();
    if (!addNotification|| addNotification == undefined || addNotification.id=="") {
      response.setError("cannot find Notification Data ",true);
  }
    let newNotification: Notification = new Notification();
   
      
      try {
        newNotification = Object.assign(newNotification, addNotification);
        newNotification.createdOnDate = new Date().getTime();
        let result = await this.notificationRepository.add(newNotification);
        let updatedResult= await this.notificationRepository.update(result);
        response.setSuccessAndData(updatedResult, "Notification Added");


    } catch (error) {
        response.setServerError(error);
    }
    return response;
  }


  public async getnotification(id: string): Promise<ResponseModel<Notification>> {
    let response: ResponseModel<Notification> = new ResponseModel<Notification>();
    try {
      let notificationData = await this.notificationRepository.get(id);
      if(!notificationData || notificationData == undefined){ 
        response.setError("cannot find notification",true);
      }
      else{
        let newNotification: Notification = new Notification();
        newNotification = Object.assign(newNotification,notificationData);
        response.setSuccessAndData(newNotification,'');
      } 
    }
    catch (err) {
      response.setServerError(err);
    }
    return response;    
  }


  public async deltePost(id: string): Promise<ResponseModel<boolean>> {
    let response: ResponseModel<boolean> = new ResponseModel<boolean>();
    try {
      let delnotification = await this.notificationRepository.delete(id);
      response.setSuccessAndData(delnotification, "");
    }
    
    catch (err) {
      response.setServerError(err.message);
    }
    return response;
  }

  public async sendPushNotification(data:any){
    console.log("PUSH NOTIFICATION USERID",data["UserId"]);
    await this.notificationService.sendNotification(data);
  }

}
