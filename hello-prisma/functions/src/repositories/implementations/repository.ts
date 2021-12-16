import { injectable } from "inversify";
import { IBaseEntity } from "../../models/repomodels/ibaseentity";
import { IRepository } from "../interfaces/irepository";
import admin = require("firebase-admin");

// import {CountService  } from "../../services/implementations/count-service";
// import SERVICE_IDENTIFIER from "../../identifiers";
// import { ICountService } from "../../services/interfaces/icount-service";

import { CollectionReference, QuerySnapshot } from "@google-cloud/firestore";
@injectable()
export abstract class Repository<T extends IBaseEntity>
  implements IRepository<T>
{
  public db: admin.firestore.Firestore;
  public abstract collectionName: string;
  constructor() {
    // private countService?: ICountService //   @inject(SERVICE_IDENTIFIER.CountService)
    this.db = admin.firestore();
  }

  /**
   * Get record of Type T for id
   * @param id Unique Id for record
   */
  async get(id: string): Promise<T> {
    console.info("Get ${id} from ${this.collectionName}");

    const doc = await this.getCollection().doc(id).get();
    console.log(doc);
    const entity = doc.data() as T;
    if (entity) {
      entity.id = doc.id;
    }
    return entity;
  }

  async getSubCollectionByPaginationAndArrayContain(
    subCollection: string,
    key: string,
    id: string,
    page: number,
    count: number
  ): Promise<T[]> {
    const entities: T[] = [];
    const snapshot = await admin
      .firestore()
      .collectionGroup(subCollection)
      .where(key, "array-contains", id)
      .offset((page - 1) * count)
      .limit(count)
      .get();
    snapshot.forEach((doc) => {
      const entity = doc.data() as T;
      if (entity) {
        entity.id = doc.id;
        entities.push(entity);
      }
    });
    return entities;
  }

  async getSubCollectionByPaginationAndArrayContainByTwoWhere(subCollection: string, key1: string, id1: string, key2: string, id2: string, page: number, count: number
  ): Promise<T[]> {
    const entities: T[] = [];
    const snapshot = await admin
      .firestore()
      .collectionGroup(subCollection)
      .where(key1, "array-contains", id1)
      .where(key2, "==", id2)
      .offset((page - 1) * count)
      .limit(count)
      .get();
    snapshot.forEach((doc) => {
      const entity = doc.data() as T;
      if (entity) {
        entity.id = doc.id;
        entities.push(entity);
      }
    });
    return entities;
  }

  async getSubCollectionByPaginationAndArrayContainByThreeWhere(subCollection: string, key1: string, id1: string, key2: string, id2: string, key3: string, id3: string, page: number, count: number
  ): Promise<T[]> {
    const entities: T[] = [];
    const snapshot = await admin
      .firestore()
      .collectionGroup(subCollection)
      .where(key1, "array-contains", id1)
      .where(key2, "==", id2)
      .where(key3, "==", id3)
      .offset((page - 1) * count)
      .limit(count)
      .get();
    snapshot.forEach((doc) => {
      const entity = doc.data() as T;
      if (entity) {
        entity.id = doc.id;
        entities.push(entity);
      }
    });
    return entities;
  }


  async getSubCollectionByArrayContainWithThreeNotMatch(subCollection: string, key1: string, id1: string, key2: string, id2: string, key3: string, id3: string, page: number, count: number): Promise<T[]> {
    const entities: T[] = [];
    const snapshot = await admin
      .firestore()
      .collectionGroup(subCollection)
      .where(key1, "array-contains", id1)
      .where(key2, "!=", id2)
      .where(key3, "==", id3)
      .offset((page - 1) * count)
      .limit(count)
      .get();
    snapshot.forEach((doc) => {
      const entity = doc.data() as T;
      if (entity) {
        entity.id = doc.id;
        entities.push(entity);
      }
    });
    return entities;
  }

  async getBySubCollection(
    subCollection: string,
    key: string,
    id: string,
    page: number,
    count: number
  ): Promise<T[]> {
    const entities: T[] = [];
    const snapshot = await admin
      .firestore()
      .collectionGroup(subCollection)
      .where(key, "==", id)
      .offset((page - 1) * count)
      .limit(count)
      .get();
    snapshot.forEach((doc) => {
      const entity = doc.data() as T;
      if (entity) {
        entity.id = doc.id;
        entities.push(entity);
      }
    });
    return entities;
  }

  async getSubCollectionByCollectionGroup(
    subCollection: string,
    key: string,
    id: string,
    page: number,
    count: number
  ): Promise<T[]> {
    const entities: T[] = [];
    const snapshot = await admin
      .firestore()
      .collectionGroup(subCollection)
      .where(key, "==", id)
      .offset((page - 1) * count)
      .limit(count)
      .get();
    snapshot.forEach((doc) => {
      const entity = doc.data() as T;
      if (entity) {
        entity.id = doc.id;
        entities.push(entity);
      }
    });
    return entities;
  }

  async getBySubCollectionByTwoWhere(
    subCollection: string,
    key1: string,
    id1: string,
    key2: string,
    id2: string,
    page: number,
    count: number
  ): Promise<T[]> {
    const entities: T[] = [];
    const snapshot = await admin
      .firestore()
      .collectionGroup(subCollection)
      .where(key1, "==", id1)
      .where(key2, "==", id2)
      .offset((page - 1) * count)
      .limit(count)
      .get();
    snapshot.forEach((doc) => {
      const entity = doc.data() as T;
      if (entity) {
        entity.id = doc.id;
        entities.push(entity);
      }
    });
    return entities;
  }

  async getAll(): Promise<T[]> {
    const entities: T[] = [];
    const snapshot = await this.getCollection()
      .orderBy("createdOnDate", "desc")
      .get();

    snapshot.forEach((doc) => {
      const entity = doc.data() as T;
      if (entity) {
        entity.id = doc.id;
        entities.push(entity);
      }
    });
    return entities;
  }

  async getAllByTwoWhere(
    page: number,
    count: number,
    key1: string,
    id1: string,
    key2: string,
    id2: string
  ): Promise<T[]> {
    const entities: T[] = [];
    const snapshot = await this.getCollection()
      .where(key1, "==", id1)
      .where(key2, "==", id2)
      .orderBy("createdOnDate", "desc")
      .offset((page - 1) * count)
      .limit(count)
      .get();
    snapshot.forEach((doc) => {
      const entity = doc.data() as T;
      if (entity) {
        entity.id = doc.id;
        entities.push(entity);
      }
    });
    return entities;
  }

  async getAllByPaginateAndKeyWord(
    page: number,
    count: number,
    field: string,
    keyWord: string
  ): Promise<T[]> {
    const entities: T[] = [];
    const snapshot = await this.getCollection()
      .orderBy(field)
      .startAt(keyWord)
      .endAt(`${keyWord}\uf8ff`)
      .offset((page - 1) * count)
      .limit(count)
      .get();
    snapshot.forEach((doc) => {
      const entity = doc.data() as T;
      if (entity) {
        entity.id = doc.id;
        entities.push(entity);
      }
    });
    return entities;
  }

  async getAllByPaginationAndIdArr(
    page: number,
    count: number,
    id: string[],
    key: string
  ): Promise<T[]> {
    const entities: T[] = [];
    const snapshot = await this.getCollection()
      .where(key, "in", id)
      .orderBy("createdOnDate", "desc")
      .offset((page - 1) * count)
      .limit(count)
      .get();
    snapshot.forEach((doc) => {
      const entity = doc.data() as T;
      if (entity) {
        entity.id = doc.id;
        entities.push(entity);
      }
    });
    return entities;
  }

  async getAllIdArr(ids: string[]): Promise<T[]> {
    const entities: T[] = [];

    var idRefs = ids.map((id) =>
      admin.firestore().doc(`${this.collectionName}/${id}`)
    );
    let snapshot = await admin.firestore().getAll(...idRefs);

    snapshot.forEach((doc) => {
      const entity = doc.data() as T;
      if (entity) {
        entity.id = doc.id;
        entities.push(entity);
      }
    });
    return entities;
  }

  async batchUpdate(arrObject: any): Promise<any> {
    let batch = this.db.batch();

    arrObject.forEach((item: { id: string }) => {
      var batchRef = this.db.collection(this.collectionName).doc(item.id);
      return batch.set(batchRef, item);
    });
    return batch.commit();
  }

  async getAllByPaginationAndId(
    page: number,
    count: number,
    id: string,
    key: string
  ): Promise<T[]> {
    const entities: T[] = [];
    const snapshot = await this.getCollection()
      .where(key, "==", id)
      // .orderBy("createdOnDate", "desc")
      .offset((page - 1) * count)
      .limit(count)
      .get();
    snapshot.forEach((doc) => {
      const entity = doc.data() as T;
      if (entity) {
        entity.id = doc.id;
        entities.push(entity);
      }
    });
    return entities;
  }

  async pushObject(colId: string, key: string, id: any): Promise<T> {
    var ref = this.db.collection(this.collectionName).doc(colId);

    // Atomically add a new key to the "key" array field.
    let doc: any = await ref.update({
      [key]: admin.firestore.FieldValue.arrayUnion(id),
    });
    return doc;
  }

  async removeObject(colId: string, key: string, id: any): Promise<T> {
    var ref = this.db.collection(this.collectionName).doc(colId);

    // Atomically add a new key to the "key" array field.
    let doc: any = await ref.update({
      [key]: admin.firestore.FieldValue.arrayRemove(id),
    });
    return doc;
  }

  async getAllByPagination(page: number, count: number): Promise<T[]> {
    const entities: T[] = [];
    const snapshot = await this.getCollection()
      .orderBy("createdOnDate", "desc")
      .offset((page - 1) * count)
      .limit(count)
      .get();
    snapshot.forEach((doc) => {
      const entity = doc.data() as T;
      if (entity) {
        entity.id = doc.id;
        entities.push(entity);
      }
    });
    return entities;
  }

  public async getSubCollection(
    page: number,
    count: number,
    parentId: string,
    subCollection: string
  ): Promise<T[]> {
    const entities: T[] = [];
    let data: QuerySnapshot = await this.db
      .collection(this.collectionName)
      .doc(parentId)
      .collection(subCollection)
      .orderBy("createdOnDate", "desc")
      .offset((page - 1) * count)
      .limit(count)
      .get();
    data.forEach((doc) => {
      const entity = doc.data() as T;
      if (entity) {
        entity.id = doc.id;
        entities.push(entity);
      }
    });
    return entities;
  }

  public async getSingleSubCollection(
    id: string,
    subCollectionId: string,
    subCollection: string
  ): Promise<T> {
    const doc = await this.getCollection()
      .doc(id)
      .collection(subCollection)
      .doc(subCollectionId)
      .get();

    console.log(doc);
    const entity = doc.data() as T;
    if (entity) {
      entity.id = doc.id;
    }
    return entity;
  }

  /**
   * Add object of Type T to collection
   * @param object Object to Add
   */
  async add(object: T): Promise<T> {
    try {
      const entity = Repository.convertToObject(object);
      const loanRef = await this.db.collection(this.collectionName).add(entity);
      const doc = await loanRef.get();

      const addedDoc = doc.data() as T;
      if (addedDoc) {
        addedDoc.id = doc.id;
      }
      return addedDoc;
    } catch (e) {
      console.log(e, "Errrrrrorrrrr");
      return new Promise((_, rej) => rej(e));
    }
  }

  /**
   * Update object of Type T to collection
   * @param object Object to Update
   */
  async update(object: T): Promise<T> {
    const entity = Repository.convertToObject(object);
    await this.db.collection(this.collectionName).doc(object.id).set(entity);
    const doc = await this.get(object.id);
    return doc;
  }

  async increamentValueInField(
    parentId: string,
    key: string,
    value: number
  ): Promise<boolean> {
    const Ref = this.db.collection(this.collectionName).doc(parentId);

    // Atomically increment the population of the city by 50.
    let result = await Ref.update({
      [key]: admin.firestore.FieldValue.increment(value),
    });
    console.log("result", result);
    return true;
  }

  async decrementValueInField(parentId: string, key: string, value: number): Promise<boolean> {
    const Ref = this.db.collection(this.collectionName).doc(parentId);
    // Atomically increment the population of t
    let result = await Ref.update({
      [key]: admin.firestore.FieldValue.increment(-1 * value),
    });
    console.log("result", result);
    return true;
  }


  async addSubCollection(
    object: any,
    subCollectionName: string,
    parentCol: string
  ): Promise<T> {

    // let parentId = object[parentCol];
    let parentId = parentCol;
    console.log(parentId , 'aaaaaaaaaaaaaa')
    const entity = Repository.convertToObject(object);
    // add
    let result = await this.db
      .collection(this.collectionName)
      .doc(parentId)
      .collection(subCollectionName)
      .add(entity);

    // get
    const doc = await result.get();

    // update
    const addedDoc = doc.data() as any;
    if (addedDoc) {
      addedDoc.id = doc.id;
    }

    await this.db
      .collection(this.collectionName)
      .doc(parentId)
      .collection(subCollectionName)
      .doc(addedDoc.id)
      .update(addedDoc);
    return addedDoc;

  }


  async updateSubCollection(
    object: any,
    subCollectionName: string,
    parentCol: string
  ): Promise<T> {
    let parentId = object[parentCol];
    const entity = Repository.convertToObject(object);
    await this.db
      .collection(this.collectionName)
      .doc(parentId)
      .collection(subCollectionName)
      .doc(object.id)
      .set(entity);
    const doc = await this.getSingleSubCollection(
      parentId,
      object.id,
      subCollectionName
    );
    return doc;
  }



  /**
   * Delete object by Id
   * @param string Object Id to Update
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.db.collection(this.collectionName).doc(id).delete();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /**
   * Delete object by Id
   * @param string Object Id to Update
   */
  async deleteSubCollection(
    parentId: string,
    childId: string,
    subCollectionName: string
  ): Promise<boolean> {
    try {
      await this.db
        .collection(this.collectionName)
        .doc(parentId)
        .collection(subCollectionName)
        .doc(childId)
        .delete();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  //#region Protected Helpers
  protected getCollection(): CollectionReference {
    return this.db.collection(this.collectionName);
  }
  //#endregion

  //#region Static Helpers
  static convertToObject(entity: any): any {
    let object: any = {};

    let keys = Object.keys(entity);
    if (keys[0] == "0") {
      object = entity;
    } else {
      for (let key of keys) {
        if (entity[key]) {
          if (entity[key].constructor === Array) {
            object[key] = [];
            for (let item of entity[key]) {
              object[key].push(Repository.convertToObject(item));
            }
          } else if (typeof entity[key] === "object") {
            object[key] = Repository.convertToObject(entity[key]);
          } else {
            object[key] = entity[key];
          }
        } else {
          object[key] = entity[key];
        }
      }
    }
    return object;
  }
  //#endregion
}
