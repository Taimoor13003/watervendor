// import { LoginSource } from "../../enums/enums";

export class  UserDTO {
    id: string = "";
    name:string="";
    email:string="";
    // profilePicture:string="";
    // isEmailVerified: boolean=false;
    // loginSource: LoginSource = LoginSource.default;
    // status: boolean=true;
    createdOnDate:number = new Date().getTime(); 
}
