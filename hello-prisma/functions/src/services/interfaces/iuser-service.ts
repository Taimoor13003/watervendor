import { IRemoveDeviceRequestModel } from "../../models/dtos/iremovedevicemodel";
import { ListDTO } from "../../models/dtos/listdto";
import { RegisterDeviceDTO } from "../../models/dtos/registerdevicedto";
import { ResponseModel } from "../../models/dtos/responsemodel";
import { UserDTO } from "../../models/dtos/userdto";
import { UserListDTO } from "../../models/dtos/userlistdto";
import { User } from "../../models/repomodels/user";



export interface IUserService {
  registerUserDevice(data: RegisterDeviceDTO) : Promise<ResponseModel<boolean>>;
  unregisterUserDevice(data: IRemoveDeviceRequestModel) : Promise<ResponseModel<boolean>>  ;
  findOne(userId: string): Promise<ResponseModel<UserDTO>>;
  signUp(userDTO: UserDTO,userId: string): Promise<ResponseModel<UserDTO>>;
  signIn(userId: string): Promise<ResponseModel<UserDTO>>;
  getAllByPagination(page: number, count: number,keyword:string):Promise<ResponseModel<ListDTO<UserListDTO>>>
  update(userDTO:UserDTO,userId: string): Promise<ResponseModel<User>>
 }
 