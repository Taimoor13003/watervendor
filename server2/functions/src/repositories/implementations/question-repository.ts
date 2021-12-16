import { Repository } from "./repository";
import { Question } from '../../models/repomodels/question';
import { IQuestionRepository } from '../interfaces/iquestion-repository';


export class QuestionRepository extends Repository<Question> implements IQuestionRepository {
    public collectionName = "questions"; 
    constructor() {
        super();
    }
}


1