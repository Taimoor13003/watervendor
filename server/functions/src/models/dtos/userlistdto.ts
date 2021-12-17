
export class  UserListDTO {
    id: string = "";
    firstName:string="";
    lastName:string="";
    fullName:string="";
    userName:string="";
    profilePicture:string="";
    createdOnDate:number = new Date().getTime(); 
    // coordinate: object=[];
}
