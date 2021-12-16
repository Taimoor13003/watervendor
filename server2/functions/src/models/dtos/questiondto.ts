import { QuestionType } from '../../enums/enums';
import { OptionDTO } from './optiondto';

export class QuestionDTO {
    id : string = "";
    categoryId : string = "";
    type : QuestionType = QuestionType.mcq;
    text: string = "";
    options: OptionDTO[] = [] ;
    nextQuestionId: string = "";
    createdOnDate:number = new Date().getTime(); 
}