// import { IRemoveDeviceRequestModel } from "../../models/dtos/iremovedevicemodel";
// import { ListDTO } from "../../models/dtos/listdto";  
import { QuestionDTO } from '../../models/dtos/questiondto';
// import { RegisterDeviceDTO } from "../../models/dtos/registerdevicedto";
import { ResponseModel } from "../../models/dtos/responsemodel";
// import { UserDTO } from "../../models/dtos/userdto";
// import { UserListDTO } from "../../models/dtos/userlistdto";
// import { User } from "../../models/repomodels/user";
// import { Question } from '../../models/repomodels/question';



export interface IQuestionService {
  create(questionDTO: QuestionDTO) : Promise<ResponseModel<QuestionDTO>>;
  getQuestion(questionId: string) : Promise<ResponseModel<QuestionDTO>>;
  // getAllQuestions(page : number , count : number) : Promise<ResponseModel<ListDTO<QuestionDTO>>>;
  // updateQuestion(question:QuestionDTO): Promise<ResponseModel<QuestionDTO>>
  // unregisterUserDevice(data: IRemoveDeviceRequestModel) : Promise<ResponseModel<boolean>>  ;
  // findOne(userId: string): Promise<ResponseModel<UserDTO>>;
  // signUp(userDTO: UserDTO,userId: string): Promise<ResponseModel<UserDTO>>;
  // signIn(userId: string): Promise<ResponseModel<UserDTO>>;
  // getAllByPagination(page: number, count: number,keyword:string):Promise<ResponseModel<ListDTO<UserListDTO>>>
 }
 