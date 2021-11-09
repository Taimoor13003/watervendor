import { QuestionType } from '../../enums/enums';
import { OptionDTO } from '../dtos/optiondto';
import { IBaseEntity } from './ibaseentity';

export class Question implements IBaseEntity {
    id: string = "";
    categoryId: string = "";
    type: QuestionType = QuestionType.mcq;
    text: string = "";
    options: OptionDTO[] = [];
    nextQuestionId: string = "";
    createdOnDate: number = new Date().getTime();
}