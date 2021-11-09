import { Visit } from "../../models/repomodels/visit";
import { IVisitRepository } from "../interfaces/ivisit-repository";
import { Repository } from "./repository";


export class VisitRepository extends Repository<Visit > implements IVisitRepository {
    public collectionName = "visits"; 
    
    constructor() {
        super();
    }
}
