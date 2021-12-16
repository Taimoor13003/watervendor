export interface IBaseEntity {
    id:string;
    createdOnDate:number;
    Data?: {
        [key: string]: string;
    }
}
