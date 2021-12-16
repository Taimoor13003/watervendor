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
exports.UserService = void 0;
const inversify_1 = require("inversify");
const usernotificationservice_1 = require("../../backyard-notifications/services/usernotificationservice");
const identifiers_1 = require("../../identifiers");
const listdto_1 = require("../../models/dtos/listdto");
const responsemodel_1 = require("../../models/dtos/responsemodel");
const userdto_1 = require("../../models/dtos/userdto");
const userlistdto_1 = require("../../models/dtos/userlistdto");
const user_1 = require("../../models/repomodels/user");
const datacopier_1 = require("../../utilities/datacopier");
const utility_service_1 = require("./utility-service");
let UserService = class UserService {
    constructor(userRepository, userNotificationService = new usernotificationservice_1.UserNotificationService()) {
        this.userRepository = userRepository;
        this.userNotificationService = userNotificationService;
    }
    async signUp(userDTO, userId) {
        let response = new responsemodel_1.ResponseModel();
        try {
            // add id field in userDto
            Object.assign(userDTO, { id: userId });
            let user = await this.userRepository.get(userDTO.id);
            if (!user) {
                let user = new user_1.User();
                user = utility_service_1.UtilityService.DataCopier(user, userDTO);
                await this.userRepository.update(user);
                response.setSuccessAndData(user, "Sign Up Successfull");
            }
            else {
                if (user.email == userDTO.email) {
                    response.setServerError("your email is already register");
                }
                else {
                    response.setServerError("your id is already register");
                }
            }
        }
        catch (err) {
            response.setServerError(err);
        }
        return response;
    }
    async signIn(userId) {
        let response = new responsemodel_1.ResponseModel();
        try {
            let user = await this.userRepository.get(userId);
            if (user != null) {
                let userDTO = new userdto_1.UserDTO();
                userDTO = utility_service_1.UtilityService.DataCopier(userDTO, user);
                response.setSuccessAndData(userDTO, "Sign in successfull");
            }
            else {
                response.setSuccess("user does not exist");
            }
        }
        catch (err) {
            response.setServerError(err);
        }
        return response;
    }
    async findOne(userId) {
        let response = new responsemodel_1.ResponseModel();
        try {
            let user = await this.userRepository.get(userId);
            if (user != null) {
                let userDTO = new userdto_1.UserDTO();
                userDTO = utility_service_1.UtilityService.DataCopier(userDTO, user);
                response.setSuccessAndData(userDTO, "");
            }
            else {
                response.setSuccess("User does not exist,");
            }
        }
        catch (err) {
            response.setServerError(err);
        }
        return response;
    }
    async unregisterUserDevice(removeUserDevice) {
        let response = new responsemodel_1.ResponseModel();
        try {
            await this.userNotificationService.unsubscribeDevice(removeUserDevice);
            response.setSuccessAndData(true, '');
        }
        catch (err) {
            response.setError(err.message);
        }
        return response;
    }
    async registerdevice(userId, fcmtoken, type) {
        try {
            let userDevice = {
                UserId: userId,
                DeviceId: fcmtoken,
                // Type: type,          
                Type: "All",
            };
            console.log('type', type);
            await this.userNotificationService.subscribeDevice(userDevice);
            console.log("Subscribe Device Done");
            let subscription = {
                UserId: userId,
                Topic: "All",
            };
            await this.userNotificationService.subscribeTopic(subscription);
        }
        catch (err) {
            console.log(err);
        }
    }
    async registerUserDevice(registerData) {
        let response = new responsemodel_1.ResponseModel();
        try {
            await this.registerdevice(registerData.userId, registerData.fcmToken, registerData.type);
            response.setSuccessAndData(true, '');
        }
        catch (err) {
            response.setError(err.message);
        }
        return response;
    }
    async getAllByPagination(page, count, keyword = "") {
        let response = new responsemodel_1.ResponseModel();
        try {
            let userLists = [];
            if (!keyword) {
                userLists = await this.userRepository.getAllByPagination(+page, +count);
            }
            else {
                userLists = await this.userRepository.getAllByPaginateAndKeyWord(+page, +count, 'fullName', keyword);
            }
            let listdto = new listdto_1.ListDTO();
            userLists.forEach((item) => {
                let singleEntity = new userlistdto_1.UserListDTO();
                singleEntity = datacopier_1.DataCopier.copy(singleEntity, item);
                listdto.list.push(singleEntity);
            });
            listdto.size = listdto.list.length;
            listdto.page = +page;
            response.setSuccessAndData(listdto, "");
        }
        catch (err) {
            response.setServerError(err);
        }
        return response;
    }
    async update(userDTO, userId) {
        let response = new responsemodel_1.ResponseModel();
        try {
            userDTO.id = userId;
            let getUser = await this.userRepository.get(userId);
            if (!getUser) {
                response.setServerError("your id is invalid");
            }
            else {
                let user = new user_1.User();
                user = utility_service_1.UtilityService.DataCopier(user, userDTO);
                const getByEmail = await this.userRepository.getAllByPaginationAndId(1, 1, user.email, 'email');
                if (getByEmail.length > 0 && getUser.email != user.email) {
                    response.setError("email is already register");
                }
                else {
                    user.createdOnDate = getUser.createdOnDate;
                    const update = await this.userRepository.update(user);
                    response.setSuccessAndData(update, "Sign Up Successfull");
                }
            }
        }
        catch (err) {
            response.setServerError(err);
        }
        return response;
    }
};
UserService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(identifiers_1.default.UserRepository))
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user-service.js.map