import { injectable } from "inversify";
import { IBaseEntity } from "../../models/repomodels/ibaseentity";
import { IRepository } from "../interfaces/irepository";
// import admin = require("firebase-admin");
import { PrismaClient } from '@prisma/client'

// import {CountService  } from "../../services/implementations/count-service";
// import SERVICE_IDENTIFIER from "../../identifiers";
// import { ICountService } from "../../services/interfaces/icount-service";

// import { CollectionReference, QuerySnapshot } from "@google-cloud/firestore";
@injectable()
export abstract class Repository<T extends IBaseEntity>
  implements IRepository<T>
{
  // public db: admin.firestore.Firestore;
  public db: PrismaClient ;
  public abstract collectionName: string;
  constructor() {
    // private countService?: ICountService //   @inject(SERVICE_IDENTIFIER.CountService)
    // this.db = admin.firestore();
    this.db = new PrismaClient();
  }

  /**
   * Get record of Type T for id
   * @param id Unique Id for record
   */
  async get(id: string): Promise<T> {

    console.info("Get ${id} from ${this.collectionName}");
    // this.db.user.create({

    // })
    const name = "user" 
    this.db[name]
    // .create({data:{}})
    // @ts-ignore

    const doc = await this.getCollection().doc(id).get();
    console.log(doc);
    const entity = doc.data() as T;
    if (entity) {
      entity.id = doc.id;
    }
    return entity;

  }





  //#endregion
}
