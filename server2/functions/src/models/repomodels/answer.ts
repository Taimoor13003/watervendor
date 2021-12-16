import { IBaseEntity } from "./ibaseentity";
import { Question } from "./question"

export class Visit implements IBaseEntity {
    id:string=""
    visitId:string=""
    categoryId:string=""
    questionId:string = ""
    selectedOptionId  :  string =""
    selectedOptionText:string=""
    serialNo:number = 1
    question:Question =<Question> {}
    createdOnDate: number = new Date().getTime()
}