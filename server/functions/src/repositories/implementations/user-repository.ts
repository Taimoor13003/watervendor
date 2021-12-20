import { PrismaModel } from "../../enums/enums";
import { User } from "../../models/repomodels/user";
import { IUserRepository } from "../interfaces/iuser-repository";
import { Repository } from "./repository";


export class UserRepository extends Repository<User> implements IUserRepository {
    public collectionName = "user"  ; 
    public collectionName2 : PrismaModel = PrismaModel.user
    constructor() {

        super();
    }
}


