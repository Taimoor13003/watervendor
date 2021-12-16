"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Repository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
const inversify_1 = require("inversify");
const admin = require("firebase-admin");
let Repository = Repository_1 = class Repository {
    constructor() {
        // private countService?: ICountService //   @inject(SERVICE_IDENTIFIER.CountService)
        this.db = admin.firestore();
    }
    /**
     * Get record of Type T for id
     * @param id Unique Id for record
     */
    async get(id) {
        console.info("Get ${id} from ${this.collectionName}");
        const doc = await this.getCollection().doc(id).get();
        console.log(doc);
        const entity = doc.data();
        if (entity) {
            entity.id = doc.id;
        }
        return entity;
    }
    async getSubCollectionByPaginationAndArrayContain(subCollection, key, id, page, count) {
        const entities = [];
        const snapshot = await admin
            .firestore()
            .collectionGroup(subCollection)
            .where(key, "array-contains", id)
            .offset((page - 1) * count)
            .limit(count)
            .get();
        snapshot.forEach((doc) => {
            const entity = doc.data();
            if (entity) {
                entity.id = doc.id;
                entities.push(entity);
            }
        });
        return entities;
    }
    async getSubCollectionByPaginationAndArrayContainByTwoWhere(subCollection, key1, id1, key2, id2, page, count) {
        const entities = [];
        const snapshot = await admin
            .firestore()
            .collectionGroup(subCollection)
            .where(key1, "array-contains", id1)
            .where(key2, "==", id2)
            .offset((page - 1) * count)
            .limit(count)
            .get();
        snapshot.forEach((doc) => {
            const entity = doc.data();
            if (entity) {
                entity.id = doc.id;
                entities.push(entity);
            }
        });
        return entities;
    }
    async getSubCollectionByPaginationAndArrayContainByThreeWhere(subCollection, key1, id1, key2, id2, key3, id3, page, count) {
        const entities = [];
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
            const entity = doc.data();
            if (entity) {
                entity.id = doc.id;
                entities.push(entity);
            }
        });
        return entities;
    }
    async getSubCollectionByArrayContainWithThreeNotMatch(subCollection, key1, id1, key2, id2, key3, id3, page, count) {
        const entities = [];
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
            const entity = doc.data();
            if (entity) {
                entity.id = doc.id;
                entities.push(entity);
            }
        });
        return entities;
    }
    async getBySubCollection(subCollection, key, id, page, count) {
        const entities = [];
        const snapshot = await admin
            .firestore()
            .collectionGroup(subCollection)
            .where(key, "==", id)
            .offset((page - 1) * count)
            .limit(count)
            .get();
        snapshot.forEach((doc) => {
            const entity = doc.data();
            if (entity) {
                entity.id = doc.id;
                entities.push(entity);
            }
        });
        return entities;
    }
    async getSubCollectionByCollectionGroup(subCollection, key, id, page, count) {
        const entities = [];
        const snapshot = await admin
            .firestore()
            .collectionGroup(subCollection)
            .where(key, "==", id)
            .offset((page - 1) * count)
            .limit(count)
            .get();
        snapshot.forEach((doc) => {
            const entity = doc.data();
            if (entity) {
                entity.id = doc.id;
                entities.push(entity);
            }
        });
        return entities;
    }
    async getBySubCollectionByTwoWhere(subCollection, key1, id1, key2, id2, page, count) {
        const entities = [];
        const snapshot = await admin
            .firestore()
            .collectionGroup(subCollection)
            .where(key1, "==", id1)
            .where(key2, "==", id2)
            .offset((page - 1) * count)
            .limit(count)
            .get();
        snapshot.forEach((doc) => {
            const entity = doc.data();
            if (entity) {
                entity.id = doc.id;
                entities.push(entity);
            }
        });
        return entities;
    }
    async getAll() {
        const entities = [];
        const snapshot = await this.getCollection()
            .orderBy("createdOnDate", "desc")
            .get();
        snapshot.forEach((doc) => {
            const entity = doc.data();
            if (entity) {
                entity.id = doc.id;
                entities.push(entity);
            }
        });
        return entities;
    }
    async getAllByTwoWhere(page, count, key1, id1, key2, id2) {
        const entities = [];
        const snapshot = await this.getCollection()
            .where(key1, "==", id1)
            .where(key2, "==", id2)
            .orderBy("createdOnDate", "desc")
            .offset((page - 1) * count)
            .limit(count)
            .get();
        snapshot.forEach((doc) => {
            const entity = doc.data();
            if (entity) {
                entity.id = doc.id;
                entities.push(entity);
            }
        });
        return entities;
    }
    async getAllByPaginateAndKeyWord(page, count, field, keyWord) {
        const entities = [];
        const snapshot = await this.getCollection()
            .orderBy(field)
            .startAt(keyWord)
            .endAt(`${keyWord}\uf8ff`)
            .offset((page - 1) * count)
            .limit(count)
            .get();
        snapshot.forEach((doc) => {
            const entity = doc.data();
            if (entity) {
                entity.id = doc.id;
                entities.push(entity);
            }
        });
        return entities;
    }
    async getAllByPaginationAndIdArr(page, count, id, key) {
        const entities = [];
        const snapshot = await this.getCollection()
            .where(key, "in", id)
            .orderBy("createdOnDate", "desc")
            .offset((page - 1) * count)
            .limit(count)
            .get();
        snapshot.forEach((doc) => {
            const entity = doc.data();
            if (entity) {
                entity.id = doc.id;
                entities.push(entity);
            }
        });
        return entities;
    }
    async getAllIdArr(ids) {
        const entities = [];
        var idRefs = ids.map((id) => admin.firestore().doc(`${this.collectionName}/${id}`));
        let snapshot = await admin.firestore().getAll(...idRefs);
        snapshot.forEach((doc) => {
            const entity = doc.data();
            if (entity) {
                entity.id = doc.id;
                entities.push(entity);
            }
        });
        return entities;
    }
    async batchUpdate(arrObject) {
        let batch = this.db.batch();
        arrObject.forEach((item) => {
            var batchRef = this.db.collection(this.collectionName).doc(item.id);
            return batch.set(batchRef, item);
        });
        return batch.commit();
    }
    async getAllByPaginationAndId(page, count, id, key) {
        const entities = [];
        const snapshot = await this.getCollection()
            .where(key, "==", id)
            // .orderBy("createdOnDate", "desc")
            .offset((page - 1) * count)
            .limit(count)
            .get();
        snapshot.forEach((doc) => {
            const entity = doc.data();
            if (entity) {
                entity.id = doc.id;
                entities.push(entity);
            }
        });
        return entities;
    }
    async pushObject(colId, key, id) {
        var ref = this.db.collection(this.collectionName).doc(colId);
        // Atomically add a new key to the "key" array field.
        let doc = await ref.update({
            [key]: admin.firestore.FieldValue.arrayUnion(id),
        });
        return doc;
    }
    async removeObject(colId, key, id) {
        var ref = this.db.collection(this.collectionName).doc(colId);
        // Atomically add a new key to the "key" array field.
        let doc = await ref.update({
            [key]: admin.firestore.FieldValue.arrayRemove(id),
        });
        return doc;
    }
    async getAllByPagination(page, count) {
        const entities = [];
        const snapshot = await this.getCollection()
            .orderBy("createdOnDate", "desc")
            .offset((page - 1) * count)
            .limit(count)
            .get();
        snapshot.forEach((doc) => {
            const entity = doc.data();
            if (entity) {
                entity.id = doc.id;
                entities.push(entity);
            }
        });
        return entities;
    }
    async getSubCollection(page, count, parentId, subCollection) {
        const entities = [];
        let data = await this.db
            .collection(this.collectionName)
            .doc(parentId)
            .collection(subCollection)
            .orderBy("createdOnDate", "desc")
            .offset((page - 1) * count)
            .limit(count)
            .get();
        data.forEach((doc) => {
            const entity = doc.data();
            if (entity) {
                entity.id = doc.id;
                entities.push(entity);
            }
        });
        return entities;
    }
    async getSingleSubCollection(id, subCollectionId, subCollection) {
        const doc = await this.getCollection()
            .doc(id)
            .collection(subCollection)
            .doc(subCollectionId)
            .get();
        console.log(doc);
        const entity = doc.data();
        if (entity) {
            entity.id = doc.id;
        }
        return entity;
    }
    /**
     * Add object of Type T to collection
     * @param object Object to Add
     */
    async add(object) {
        try {
            const entity = Repository_1.convertToObject(object);
            const loanRef = await this.db.collection(this.collectionName).add(entity);
            const doc = await loanRef.get();
            const addedDoc = doc.data();
            if (addedDoc) {
                addedDoc.id = doc.id;
            }
            return addedDoc;
        }
        catch (e) {
            console.log(e, "Errrrrrorrrrr");
            return new Promise((_, rej) => rej(e));
        }
    }
    /**
     * Update object of Type T to collection
     * @param object Object to Update
     */
    async update(object) {
        const entity = Repository_1.convertToObject(object);
        await this.db.collection(this.collectionName).doc(object.id).set(entity);
        const doc = await this.get(object.id);
        return doc;
    }
    async increamentValueInField(parentId, key, value) {
        const Ref = this.db.collection(this.collectionName).doc(parentId);
        // Atomically increment the population of the city by 50.
        let result = await Ref.update({
            [key]: admin.firestore.FieldValue.increment(value),
        });
        console.log("result", result);
        return true;
    }
    async decrementValueInField(parentId, key, value) {
        const Ref = this.db.collection(this.collectionName).doc(parentId);
        // Atomically increment the population of t
        let result = await Ref.update({
            [key]: admin.firestore.FieldValue.increment(-1 * value),
        });
        console.log("result", result);
        return true;
    }
    async addSubCollection(object, subCollectionName, parentCol) {
        // let parentId = object[parentCol];
        let parentId = parentCol;
        console.log(parentId, 'aaaaaaaaaaaaaa');
        const entity = Repository_1.convertToObject(object);
        // add
        let result = await this.db
            .collection(this.collectionName)
            .doc(parentId)
            .collection(subCollectionName)
            .add(entity);
        // get
        const doc = await result.get();
        // update
        const addedDoc = doc.data();
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
    async updateSubCollection(object, subCollectionName, parentCol) {
        let parentId = object[parentCol];
        const entity = Repository_1.convertToObject(object);
        await this.db
            .collection(this.collectionName)
            .doc(parentId)
            .collection(subCollectionName)
            .doc(object.id)
            .set(entity);
        const doc = await this.getSingleSubCollection(parentId, object.id, subCollectionName);
        return doc;
    }
    /**
     * Delete object by Id
     * @param string Object Id to Update
     */
    async delete(id) {
        try {
            await this.db.collection(this.collectionName).doc(id).delete();
            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
    /**
     * Delete object by Id
     * @param string Object Id to Update
     */
    async deleteSubCollection(parentId, childId, subCollectionName) {
        try {
            await this.db
                .collection(this.collectionName)
                .doc(parentId)
                .collection(subCollectionName)
                .doc(childId)
                .delete();
            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
    //#region Protected Helpers
    getCollection() {
        return this.db.collection(this.collectionName);
    }
    //#endregion
    //#region Static Helpers
    static convertToObject(entity) {
        let object = {};
        let keys = Object.keys(entity);
        if (keys[0] == "0") {
            object = entity;
        }
        else {
            for (let key of keys) {
                if (entity[key]) {
                    if (entity[key].constructor === Array) {
                        object[key] = [];
                        for (let item of entity[key]) {
                            object[key].push(Repository_1.convertToObject(item));
                        }
                    }
                    else if (typeof entity[key] === "object") {
                        object[key] = Repository_1.convertToObject(entity[key]);
                    }
                    else {
                        object[key] = entity[key];
                    }
                }
                else {
                    object[key] = entity[key];
                }
            }
        }
        return object;
    }
};
Repository = Repository_1 = __decorate([
    inversify_1.injectable()
], Repository);
exports.Repository = Repository;
//# sourceMappingURL=repository.js.map