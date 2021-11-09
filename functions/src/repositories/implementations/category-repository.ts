import { Category } from "../../models/repomodels/category";
import { ICategoryRepository } from "../interfaces/icategory-repository";
import { Repository } from "./repository";


export class CategoryRepository extends Repository<Category> implements ICategoryRepository {
    public collectionName = "categories"; 
    constructor() {

        super();
    }
}


 