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
exports.VisitService = void 0;
// import { IRemoveDeviceRequestModel } from "../../backyard-notifications/dto/iremovedevicemodel";
// import { UserNotificationService } from "../../backyard-notifications/services/usernotificationservice";
// import { ListDTO } from "../../models/dtos/listdto";
// import { RegisterDeviceDTO } from "../../models/dtos/registerdevicedto";
// import { UserDTO } from "../../models/dtos/userdto";
// import { UserListDTO } from "../../models/dtos/userlistdto";
// import { User } from "../../models/repomodels/user";
// import { IUserRepository } from "../../repositories/interfaces/iuser-repository";
// import { DataCopier } from '../../utilities/datacopier';
// import { IUserService } from "../interfaces/iuser-service";
const inversify_1 = require("inversify");
const identifiers_1 = require("../../identifiers");
const responsemodel_1 = require("../../models/dtos/responsemodel");
const utility_service_1 = require("./utility-service");
const visit_1 = require("../../models/repomodels/visit");
const visitanswer_1 = require("../../models/repomodels/visitanswer");
let VisitService = class VisitService {
    constructor(visitRepository, questionRepository) {
        this.visitRepository = visitRepository;
        this.questionRepository = questionRepository;
    }
    async create(visitDTO) {
        let response = new responsemodel_1.ResponseModel();
        try {
            let visit = new visit_1.Visit();
            visit = utility_service_1.UtilityService.DataCopier(visit, visitDTO);
            let result = await this.visitRepository.add(visit);
            result = await this.visitRepository.update(result);
            response.setSuccessAndData(result, "visit successfully added");
            console.log(visit);
        }
        catch (err) {
            response.setServerError(err);
        }
        return response;
    }
    async createAnswer(visitID, questionID, optionId) {
        let response = new responsemodel_1.ResponseModel();
        try {
            // const visit: VisitDTO = await this.visitRepository.get(visitID)
            const question = await this.questionRepository.get(questionID);
            const chosenOtion = question.options.find(x => x.id == optionId);
            if (!question || !chosenOtion) {
                response.setError('Not added');
            }
            else {
                let visitAnswer = new visitanswer_1.VisitAnswer();
                const visitAnswerDto = {
                    id: "1",
                    visitId: visitID,
                    categoryId: question.categoryId,
                    questionId: questionID,
                    selectedOptionId: optionId,
                    selectedOptionText: chosenOtion.text,
                    serialNo: 0,
                    question: question
                };
                visitAnswer = utility_service_1.UtilityService.DataCopier(visitAnswer, visitAnswerDto);
                // let visitAnswer = new VisitAnswer();
                // visitAnswer = UtilityService.DataCopier(visitAnswer, visitAnswerDTO);
                console.log(visitAnswer, 'ooooooooooooooooooooooooooooooo');
                await this.visitRepository.addSubCollection(visitAnswer, "answers", visitID);
                // result = await this.visitRepository.update(result)
                response.setSuccessAndData(visitAnswerDto, "answer successfully added");
            }
        }
        catch (err) {
            response.setServerError(err);
        }
        return response;
    }
    /**
      *
      * @param id string
      * @returns The Visit Object or `Error` if the id is not found.
      */
    async getVisit(id) {
        const response = new responsemodel_1.ResponseModel();
        try {
            let visit = await this.visitRepository.get(id);
            if (visit) {
                response.setSuccessAndData(visit, '');
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
VisitService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(identifiers_1.default.VisitRepository)),
    __param(1, inversify_1.inject(identifiers_1.default.QuestionRepository))
], VisitService);
exports.VisitService = VisitService;
//# sourceMappingURL=visit-service.js.map