// import { IRemoveDeviceRequestModel } from "../../models/dtos/iremovedevicemodel";
// import { ListDTO } from "../../models/dtos/listdto";  
import { VisitDTO } from '../../models/dtos/visitdto';
// import { RegisterDeviceDTO } from "../../models/dtos/registerdevicedto";
import { ResponseModel } from "../../models/dtos/responsemodel";
import { VisitAnswerDTO } from "../../models/dtos/visitanswerdto";
// import { UserDTO } from "../../models/dtos/userdto";
// import { UserListDTO } from "../../models/dtos/userlistdto";
// import { User } from "../../models/repomodels/user";
// import { Visit } from '../../models/repomodels/visit';



export interface IVisitService {
  create(visitDTO: VisitDTO) : Promise<ResponseModel<VisitDTO>>;
  getVisit(visitId: string) : Promise<ResponseModel<VisitDTO>>;

  createAnswer(visitID :string , questionID : string , optionId : string) : Promise<ResponseModel<VisitAnswerDTO>>;
  // getAnswer(answerId: string) : Promise<ResponseModel<VisitAnswerDTO>>;

  // getAllVisits(page : number , count : number) : Promise<ResponseModel<ListDTO<VisitDTO>>>;
  // updateVisit(visit:VisitDTO): Promise<ResponseModel<VisitDTO>>
  // unregisterUserDevice(data: IRemoveDeviceRequestModel) : Promise<ResponseModel<boolean>>  ;
  // findOne(userId: string): Promise<ResponseModel<UserDTO>>;
  // signUp(userDTO: UserDTO,userId: string): Promise<ResponseModel<UserDTO>>;
  // signIn(userId: string): Promise<ResponseModel<UserDTO>>;
  // getAllByPagination(page: number, count: number,keyword:string):Promise<ResponseModel<ListDTO<UserListDTO>>>
 }
 