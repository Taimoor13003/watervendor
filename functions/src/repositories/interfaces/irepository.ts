import { IBaseEntity } from "./../../models/repomodels/ibaseentity";


export interface IRepository<T extends IBaseEntity> {
  /**
   * Get record of Type T for id
   * @param id Unique Id for record
   */
  get(id: string): Promise<T>;

  /**
   * Get All Entities
   */
  getAll(): Promise<T[]>;

  /**
   * Add object of Type T to collection
   * @param object Object to Add
   */
  add(object: T): Promise<T>;

  /**
   * Update object of Type T to collection
   * @param object Object to Update
   */
   update(object: T): Promise<T>;


     /**
   * Update object of Type T to collection
   * @param object Object to push
   */
      pushObject(docId:  string, key:  string, id:  any): Promise<T> 

     /**
   * Update docId of Type T to collection
   * @param docId docId to remove
   */
      removeObject(docId:  string, key:  string, id:  any): Promise<T> 

     /**
   * Update object of Type T to collection
   * @param arrayobject Object to Update
   */
    batchUpdate(arrObject: any): Promise<T>;


  /**
   * Delete object by Id
   * @param string Object Id to Update
   */
  delete(id: string): Promise<boolean>;

  getAllByPagination(page: number, count: number): Promise<T[]>;
  getAllByPaginateAndKeyWord(page: number, count: number,field:string, keyWord: string): Promise<T[]>;
  getSubCollection(page: number, count: number, parentId: string,subCollection: string): Promise<T[]>
  addSubCollection(object: any,subCollection: string,parentCol: string): Promise<T>;
  updateSubCollection(object: any,subCollection: string,parentCol: string): Promise<T>;
  getSingleSubCollection( id: string,subCollectionId: string,subCollection: string): Promise<T>;
  deleteSubCollection(parentId: string,childId: string,subCollectionName: string): Promise<boolean>;
  getAllByPaginationAndId(page: number, count: number, id: string,key: string): Promise<T[]>
  getAllByPaginationAndIdArr(page: number, count: number,id: string[],key: string): Promise<T[]>
  getAllIdArr(ids: string[]): Promise<T[]>
  getAllByTwoWhere(page: number, count: number, key1: string,id1: string, key2: string,id2: string): Promise<T[]>
  getSubCollectionByPaginationAndArrayContain(subCollection:string,key:string,id:string,page: number,count: number): Promise<T[]>
  getSubCollectionByPaginationAndArrayContainByTwoWhere(subCollection:string,key1:string,id1:string,key2:string,id2:string,page: number,count: number): Promise<T[]>
  getSubCollectionByPaginationAndArrayContainByThreeWhere(subCollection:string,key1:string,id1:string,key2:string,id2:string,key3:string,id3:string,page: number,count: number): Promise<T[]>
  getSubCollectionByCollectionGroup(subCollection:string,key:string,id:string,page: number,count: number): Promise<T[]>
  getBySubCollection(subCollection:string,key:string,id:string,page: number,count: number): Promise<T[]>
  getBySubCollectionByTwoWhere(subCollection:string,key1:string,id1:string,key2:string,id2:string,page: number,count: number): Promise<T[]>
  increamentValueInField(parentId:string,key:string,value:number): Promise<boolean>
  decrementValueInField(parentId:string,key:string,value:number): Promise<boolean>
  getSubCollectionByArrayContainWithThreeNotMatch(subCollection: string,key1: string,id1: string,key2: string,id2: string,key3: string,id3: string,page: number,count: number): Promise<T[]>
}
