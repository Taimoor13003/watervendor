import { inject, injectable } from "inversify";
// import { IRemoveDeviceRequestModel } from "../../backyard-notifications/dto/iremovedevicemodel";
// import { UserNotificationService } from "../../backyard-notifications/services/usernotificationservice";
import SERVICE_IDENTIFIER from "../../identifiers";
// import { ListDTO } from "../../models/dtos/listdto";
// import { RegisterDeviceDTO } from "../../models/dtos/registerdevicedto";
import { ResponseModel } from "../../models/dtos/responsemodel";
// import { UserDTO } from "../../models/dtos/userdto";
// import { UserListDTO } from "../../models/dtos/userlistdto";
// import { User } from "../../models/repomodels/user";
// import { IUserRepository } from "../../repositories/interfaces/iuser-repository";
// import { DataCopier } from "../../utilities/datacopier";
// import { IUserService } from "../interfaces/iuser-service";
import { UtilityService } from "./utility-service";
import { IQuestionService } from '../interfaces/iquestion-service';
import { IQuestionRepository } from '../../repositories/interfaces/iquestion-repository';
import { Question } from '../../models/repomodels/question';
import { QuestionDTO } from '../../models/dtos/questiondto';

@injectable()
export class QuestionService implements IQuestionService {
  constructor(

    @inject(SERVICE_IDENTIFIER.QuestionRepository)
    private questionRepository: IQuestionRepository,


  ) { }

  public async create(questionDTO: QuestionDTO): Promise<ResponseModel<QuestionDTO>> {
    let response = new ResponseModel<QuestionDTO>();
    try {
      
      let question = new Question();
      question = UtilityService.DataCopier(question, questionDTO);
      
      let result: QuestionDTO = await this.questionRepository.add(question);
      result = await this.questionRepository.update(result)

      response.setSuccessAndData(result, "question successfully added"); 
      
      console.log(question)
    } catch (err) {
      response.setServerError(err);
    }
    return response;
  }

   /**
     * 
     * @param id string 
     * @returns The Question Object or `Error` if the id is not found.
     */
    async getQuestion(id: string): Promise<ResponseModel<QuestionDTO>> {
      const response = new ResponseModel<QuestionDTO>()
      try{
          let question: QuestionDTO = await this.questionRepository.get(id)
          if(question) {
              response.setSuccessAndData(question,'')
          }else{
              response.setError('Category Is Not Found')
          }
      }catch(err){response.setServerError(err)}

      return response   
  }



}
