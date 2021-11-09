import { IBaseEntity } from "./ibaseentity";
import { VisitStatus } from "../../enums/enums"

export class Visit implements IBaseEntity {
    id:string=""
    userId:string=""
    categoryId:string=""
    name:string=""
    dateOfBirth:string =""
    lastSerialNumber:number=0
    status:VisitStatus = VisitStatus.inProgress
    createdOnDate: number = new Date().getTime()
}