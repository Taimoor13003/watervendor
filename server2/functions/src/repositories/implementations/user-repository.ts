import { User } from "../../models/repomodels/user";
import { IUserRepository } from "../interfaces/iuser-repository";
import { Repository } from "./repository";


export class UserRepository extends Repository<User> implements IUserRepository {
    public collectionName = "users"; 
    constructor() {

        super();
    }
}


1