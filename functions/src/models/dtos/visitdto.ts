import { VisitStatus } from "../../enums/enums"

export class VisitDTO {
    id: string = ""
    userId: string = ""
    categoryId: string = ""
    name: string = ""
    dateOfBirth: string = ""
    lastSerialNumber: number = 0
    status: VisitStatus = VisitStatus.inProgress
    createdOnDate: number = new Date().getTime()
}