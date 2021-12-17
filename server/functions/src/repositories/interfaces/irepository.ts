import { IBaseEntity } from "./../../models/repomodels/ibaseentity";


export interface IRepository<T extends IBaseEntity> {
  /**
   * Get record of Type T for id
   * @param id Unique Id for record
   */
  get(id: string): Promise<T>;

}
