export class ListDTO<T>{
    list:T[]=[];
    page:number=1;
    size:number=0;
    totalCount?:number=0;
}