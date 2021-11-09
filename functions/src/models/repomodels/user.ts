import { LoginSource } from "../../enums/enums";
import { IBaseEntity } from "./ibaseentity";

export class  User implements IBaseEntity{
    id: string = "";
    name:string="";
    email:string="";
    profilePicture:string="";
    isEmailVerified: boolean=false;
    loginSource: LoginSource = LoginSource.default;
    status: boolean=true;
    createdOnDate:number = new Date().getTime(); 
}
