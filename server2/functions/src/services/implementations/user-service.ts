import { inject, injectable } from "inversify";
import { IRemoveDeviceRequestModel } from "../../backyard-notifications/dto/iremovedevicemodel";
import { UserNotificationService } from "../../backyard-notifications/services/usernotificationservice";
import SERVICE_IDENTIFIER from "../../identifiers";
import { ListDTO } from "../../models/dtos/listdto";
import { RegisterDeviceDTO } from "../../models/dtos/registerdevicedto";
import { ResponseModel } from "../../models/dtos/responsemodel";
import { UserDTO } from "../../models/dtos/userdto";
import { UserListDTO } from "../../models/dtos/userlistdto";
import { User } from "../../models/repomodels/user";
import { IUserRepository } from "../../repositories/interfaces/iuser-repository";
import { DataCopier } from "../../utilities/datacopier";
import { IUserService } from "../interfaces/iuser-service";
import { UtilityService } from "./utility-service";

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(SERVICE_IDENTIFIER.UserRepository)
    private userRepository: IUserRepository,
    
    public userNotificationService:UserNotificationService=new UserNotificationService()

  ) {}

  public async signUp(userDTO: UserDTO,userId: string): Promise<ResponseModel<UserDTO>> {
    let response = new ResponseModel<UserDTO>();
    try {
      // add id field in userDto
      Object.assign(userDTO,{id:userId})

      let user = await this.userRepository.get(userDTO.id);

      if (!user) {
        let user = new User();
        user = UtilityService.DataCopier(user, userDTO);
          
          await this.userRepository.update(user);
          response.setSuccessAndData(user, "Sign Up Successfull");
        }
       else {
        if(user.email==userDTO.email){

          response.setServerError("your email is already register");
        }
        else{
          response.setServerError("your id is already register");
        }
      }
    } catch (err) {
      response.setServerError(err);
    }
    return response;
  }

  public async signIn(userId: string): Promise<ResponseModel<UserDTO>> {
    let response = new ResponseModel<UserDTO>();
    try {
      let user = await this.userRepository.get(userId);
      if (user != null) {
        let userDTO = new UserDTO();
        userDTO = UtilityService.DataCopier(userDTO, user);
        response.setSuccessAndData(userDTO, "Sign in successfull");
      } else {
        response.setSuccess("user does not exist");
      }
    } catch (err) {
      response.setServerError(err);
    }
    return response;
  }

  public async findOne(userId: string): Promise<ResponseModel<UserDTO>> {
    let response = new ResponseModel<UserDTO>();
    try {
      let user = await this.userRepository.get(userId);
      if (user != null) {
        let userDTO = new UserDTO();
        userDTO = UtilityService.DataCopier(userDTO, user);
        response.setSuccessAndData(userDTO, "");
      } else {
        response.setSuccess("User does not exist,");
      }
    } catch (err) {
      response.setServerError(err);
    }
    return response;
  }

  
  public async unregisterUserDevice(removeUserDevice: IRemoveDeviceRequestModel): Promise<ResponseModel<boolean>> {
    let response: ResponseModel<boolean> = new ResponseModel<boolean>();
    try {
      await this.userNotificationService.unsubscribeDevice(removeUserDevice);
      response.setSuccessAndData(true, '');
    }
    catch (err) {
      response.setError(err.message);
    }
    return response;
  }
  public async registerdevice(userId: string, fcmtoken: string, type: string) {
    try {
      let userDevice: any = {
        UserId: userId,
        DeviceId: fcmtoken,
        // Type: type,          
        Type: "All",
      };
      console.log('type'  , type)
      await this.userNotificationService.subscribeDevice(userDevice);
      console.log("Subscribe Device Done");
      let subscription: any = {
        UserId: userId,
        Topic: "All",
      };
      await this.userNotificationService.subscribeTopic(subscription);
    } catch (err) {
      console.log(err);
    }
  }

  public async registerUserDevice(registerData: RegisterDeviceDTO): Promise<ResponseModel<boolean>> {
    let response: ResponseModel<boolean> = new ResponseModel<boolean>();
    try {
      await this.registerdevice(registerData.userId, registerData.fcmToken, registerData.type);
      response.setSuccessAndData(true, '');
    }
    catch (err) {
      response.setError(err.message);
    }
    return response;
  }

  
  async getAllByPagination(
    page: number,
    count: number,
    keyword: string = ""
  ): Promise<ResponseModel<ListDTO<UserListDTO>>> {
    let response = new ResponseModel<ListDTO<UserListDTO>>();
    try {
      let userLists:User[] = [];

      if (!keyword) {
        userLists = await this.userRepository.getAllByPagination(+page, +count);
      }else{
        userLists = await this.userRepository.getAllByPaginateAndKeyWord(+page, +count,'fullName',keyword);
      }
      let listdto = new ListDTO<UserListDTO>();
      userLists.forEach((item: User) => {
        let singleEntity = new UserListDTO();
        singleEntity = DataCopier.copy(singleEntity, item);
        listdto.list.push(singleEntity);
      });
      listdto.size = listdto.list.length;
      listdto.page = +page;
      response.setSuccessAndData(listdto, "");
    } catch (err) {
      response.setServerError(err);
    }
    return response;
  }

  async update(userDTO: UserDTO,userId:string): Promise<ResponseModel<User>> {
    let response = new ResponseModel<User>();

    try {
      userDTO.id = userId
      let getUser = await this.userRepository.get(userId);
      if (!getUser) {
        response.setServerError("your id is invalid");
      } else {
    
        let user = new User();
        user = UtilityService.DataCopier(user, userDTO);

        const getByEmail = await this.userRepository.getAllByPaginationAndId(1,1,user.email,'email');
        if(getByEmail.length>0 && getUser.email !=user.email){
          response.setError("email is already register");
        }else{
          user.createdOnDate = getUser.createdOnDate;
          const update = await this.userRepository.update(user);
          response.setSuccessAndData(update, "Sign Up Successfull");
        }
      }
    } catch (err) {
      response.setServerError(err);
    }
    return response;
  }
}
