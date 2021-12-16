import { QuestionDTO } from '../dtos/questiondto';
import { IBaseEntity } from './ibaseentity';

export class VisitAnswer implements IBaseEntity {

    id: string = "";
    visitId: string = "";
    categoryId: string = "";
    questionId: string =  "";
    selectedOptionId: string = "";
    selectedOptionText: string = "";
    serialNo: number = 1;
    question: QuestionDTO = <QuestionDTO> {} ;
    createdOnDate: number = new Date().getTime()
}