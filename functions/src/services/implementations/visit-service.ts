// import { IRemoveDeviceRequestModel } from "../../backyard-notifications/dto/iremovedevicemodel";
// import { UserNotificationService } from "../../backyard-notifications/services/usernotificationservice";
// import { ListDTO } from "../../models/dtos/listdto";
// import { RegisterDeviceDTO } from "../../models/dtos/registerdevicedto";
// import { UserDTO } from "../../models/dtos/userdto";
// import { UserListDTO } from "../../models/dtos/userlistdto";
// import { User } from "../../models/repomodels/user";
// import { IUserRepository } from "../../repositories/interfaces/iuser-repository";
// import { DataCopier } from '../../utilities/datacopier';
// import { IUserService } from "../interfaces/iuser-service";
import { inject, injectable } from "inversify";
import SERVICE_IDENTIFIER from "../../identifiers";
import { ResponseModel } from "../../models/dtos/responsemodel";
import { UtilityService } from "./utility-service";
import { IVisitService } from '../interfaces/ivisit-service';
import { IVisitRepository } from '../../repositories/interfaces/ivisit-repository';
import { Visit } from '../../models/repomodels/visit';
import { VisitDTO } from '../../models/dtos/visitdto';
import { VisitAnswerDTO } from "../../models/dtos/visitanswerdto";
import { VisitAnswer } from '../../models/repomodels/visitanswer';
import { IQuestionRepository } from "../../repositories/interfaces/iquestion-repository";
import { QuestionDTO } from '../../models/dtos/questiondto';

@injectable()
export class VisitService implements IVisitService {
  constructor(

    @inject(SERVICE_IDENTIFIER.VisitRepository)
    private visitRepository: IVisitRepository,

    @inject(SERVICE_IDENTIFIER.QuestionRepository)
    private questionRepository: IQuestionRepository,


  ) { }

  public async create(visitDTO: VisitDTO): Promise<ResponseModel<VisitDTO>> {
    let response = new ResponseModel<VisitDTO>();
    try {

      let visit = new Visit();
      visit = UtilityService.DataCopier(visit, visitDTO);

      let result: VisitDTO = await this.visitRepository.add(visit);
      result = await this.visitRepository.update(result)

      response.setSuccessAndData(result, "visit successfully added");

      console.log(visit)
    } catch (err) {
      response.setServerError(err);
    }
    return response;
  }

  public async createAnswer(visitID: string, questionID: string, optionId: string): Promise<ResponseModel<VisitAnswerDTO>> {
    let response = new ResponseModel<VisitAnswerDTO>();
    try {

      // const visit: VisitDTO = await this.visitRepository.get(visitID)
      const question: QuestionDTO = await this.questionRepository.get(questionID)

      const chosenOtion = question.options.find(x => x.id == optionId)

      if ( !question || !chosenOtion) {
        response.setError('Not added')
      } else {


        let visitAnswer = new VisitAnswer()

        const visitAnswerDto : VisitAnswerDTO = {
          id:"1",
          visitId : visitID,
          categoryId : question.categoryId,
          questionId: questionID,
          selectedOptionId: optionId,
          selectedOptionText: chosenOtion.text,
          serialNo: 0,
          question: question
        }
        
        visitAnswer = UtilityService.DataCopier(visitAnswer, visitAnswerDto)


        // let visitAnswer = new VisitAnswer();
        // visitAnswer = UtilityService.DataCopier(visitAnswer, visitAnswerDTO);

        console.log(visitAnswer , 'ooooooooooooooooooooooooooooooo' )

       await this.visitRepository.addSubCollection(visitAnswer , "answers" , visitID );
        // result = await this.visitRepository.update(result)

        response.setSuccessAndData(visitAnswerDto, "answer successfully added");
      }

    } catch (err) {
      response.setServerError(err);
    }
    return response;
  }

  /**
    * 
    * @param id string 
    * @returns The Visit Object or `Error` if the id is not found.
    */
  async getVisit(id: string): Promise<ResponseModel<VisitDTO>> {
    const response = new ResponseModel<VisitDTO>()
    try {
      let visit: VisitDTO = await this.visitRepository.get(id)
      if (visit) {
        response.setSuccessAndData(visit, '')
      } else {
        response.setError('Category Is Not Found')
      }
    } catch (err) { response.setServerError(err) }

    return response
  }

}
