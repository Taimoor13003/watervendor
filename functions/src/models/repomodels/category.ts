import { IBaseEntity } from "./ibaseentity";

export class Category implements IBaseEntity{
    id: string = "";
    name:string="";
    text:string="";
    rootQuestionId:string="";
    createdOnDate:number = new Date().getTime(); 
}
