import { QuestionDTO } from './questiondto';

export class VisitAnswerDTO {

    id: string = "";
    visitId: string = "";
    categoryId: string = "";
    questionId: string =  "";
    selectedOptionId: string = "";
    selectedOptionText: string = "";
    serialNo: number = 1;
    question: QuestionDTO = <QuestionDTO> {} ;

}