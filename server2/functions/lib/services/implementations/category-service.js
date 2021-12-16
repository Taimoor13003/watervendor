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
exports.CategoryService = void 0;
const inversify_1 = require("inversify");
const identifiers_1 = require("../../identifiers");
const category_1 = require("../../models/dtos/category");
const category_2 = require("../../models/repomodels/category");
const responsemodel_1 = require("../../models/dtos/responsemodel");
const utility_service_1 = require("./utility-service");
const listdto_1 = require("../../models/dtos/listdto");
let CategoryService = class CategoryService {
    constructor(
    /** Category Repository */
    categoryRepository, 
    /** Qestion Repository */
    questionRepository) {
        this.categoryRepository = categoryRepository;
        this.questionRepository = questionRepository;
    }
    /**
     *
     * @param Category Object
     * @returns  Created Category
     */
    async createCategory(CategoryDTO) {
        const response = new responsemodel_1.ResponseModel();
        try {
            let categoryObject = new category_2.Category();
            categoryObject = utility_service_1.UtilityService.DataCopier(categoryObject, CategoryDTO);
            /** Add/Save Category  */
            let result = await this.categoryRepository.add(categoryObject);
            /** Update Category Id By key */
            result = await this.categoryRepository.update(result);
            response.setSuccessAndData(result, 'category create successful');
        }
        catch (err) {
            response.setServerError(err);
        }
        return response;
    }
    /**
     *
     * @param page number
     * @param limit number
     * @returns Category List.
     */
    async getAllCategory(page, limit) {
        const response = new responsemodel_1.ResponseModel();
        try {
            let categorys = await this.categoryRepository.getAllByPagination(page, limit);
            let listdto = new listdto_1.ListDTO();
            categorys.forEach((item) => {
                let singleEntity = new category_1.CategoryDTO();
                singleEntity = utility_service_1.UtilityService.DataCopier(item, singleEntity);
                listdto.list.push(item);
            });
            /**Update page number and category count in ListDTO */
            listdto.page = page;
            listdto.size = categorys.length;
            response.setSuccessAndData(listdto, '');
        }
        catch (err) {
            response.setServerError(err);
        }
        return response;
    }
    /**
     *
     * @param id string
     * @returns The Category Object or `Error` if the id is not found.
     */
    async getCategory(id) {
        const response = new responsemodel_1.ResponseModel();
        try {
            let category = await this.categoryRepository.get(id);
            if (category) {
                response.setSuccessAndData(category, '');
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
    /**
     *
     * @param category Object
     * @returns  Category or `Error` if the id is not found.
     */
    async updateCategory(category) {
        const response = new responsemodel_1.ResponseModel();
        try {
            let categoryObject = await this.categoryRepository.get(category.id);
            if (!categoryObject) {
                response.setError('Category Is Not Found');
            }
            else {
                let singleEntity = new category_2.Category();
                singleEntity = utility_service_1.UtilityService.DataCopier(category, categoryObject);
                singleEntity.createdOnDate = category.createdOnDate;
                /** Update Category */
                let result = await this.categoryRepository.update(singleEntity);
                response.setSuccessAndData(result, 'Successful Category Update');
            }
        }
        catch (err) {
            response.setServerError(err);
        }
        return response;
    }
    /**
     *
     * @param categoryId String
     * @returns Question or `Error` if (Category OR Root Qestion) Id is not found
     */
    async getRootQuestion(categoryId) {
        const response = new responsemodel_1.ResponseModel();
        try {
            let category = await this.categoryRepository.get(categoryId);
            if (!category) {
                response.setError('Category Is Not Found');
            }
            else {
                /**Get Qestion Ref In Category Root Qestion Id */
                let question = await this.questionRepository.get(category.rootQuestionId);
                if (!question) {
                    response.setError('Question Is Not Found');
                }
                else {
                    response.setSuccessAndData(question, "");
                }
            }
        }
        catch (err) {
            response.setServerError(err);
        }
        return response;
    }
};
CategoryService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(identifiers_1.default.CategoryRepository)),
    __param(1, inversify_1.inject(identifiers_1.default.QuestionRepository))
], CategoryService);
exports.CategoryService = CategoryService;
//# sourceMappingURL=category-service.js.map