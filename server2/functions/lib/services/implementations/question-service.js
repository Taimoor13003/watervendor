"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionService = void 0;
const inversify_1 = require("inversify");
// import { IRemoveDeviceRequestModel } from "../../backyard-notifications/dto/iremovedevicemodel";
// import { UserNotificationService } from "../../backyard-notifications/services/usernotificationservice";
const identifiers_1 = require("../../identifiers");
// import { ListDTO } from "../../models/dtos/listdto";
// import { RegisterDeviceDTO } from "../../models/dtos/registerdevicedto";
const responsemodel_1 = require("../../models/dtos/responsemodel");
// import { UserDTO } from "../../models/dtos/userdto";
// import { UserListDTO } from "../../models/dtos/userlistdto";
// import { User } from "../../models/repomodels/user";
// import { IUserRepository } from "../../repositories/interfaces/iuser-repository";
// import { DataCopier } from "../../utilities/datacopier";
// import { IUserService } from "../interfaces/iuser-service";
const utility_service_1 = require("./utility-service");
const question_1 = require("../../models/repomodels/question");
let QuestionService = class QuestionService {
    constructor(questionRepository) {
        this.questionRepository = questionRepository;
    }
    async create(questionDTO) {
        let response = new responsemodel_1.ResponseModel();
        try {
            let question = new question_1.Question();
            question = utility_service_1.UtilityService.DataCopier(question, questionDTO);
            let result = await this.questionRepository.add(question);
            result = await this.questionRepository.update(result);
            response.setSuccessAndData(result, "question successfully added");
            console.log(question);
        }
        catch (err) {
            response.setServerError(err);
        }
        return response;
    }
    /**
      *
      * @param id string
      * @returns The Question Object or `Error` if the id is not found.
      */
    async getQuestion(id) {
        const response = new responsemodel_1.ResponseModel();
        try {
            let question = await this.questionRepository.get(id);
            if (question) {
                response.setSuccessAndData(question, '');
            }
            else {
                response.setError('Category Is Not Found');
            }
        }
        catch (err) {
            response.setServerError(err);
        }
        return response;
    }
};
QuestionService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(identifiers_1.default.QuestionRepository))
], QuestionService);
exports.QuestionService = QuestionService;
//# sourceMappingURL=question-service.js.map