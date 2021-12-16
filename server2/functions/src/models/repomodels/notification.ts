import { IBaseEntity } from "./ibaseentity";

export class Notification implements IBaseEntity {
    id: string="";
    createdOnDate:number=new Date().getTime();
    title: string="";
    message: string="";
    icon: string="";
    topics:any="";
    data:any={};
    type:string="asd";
 }