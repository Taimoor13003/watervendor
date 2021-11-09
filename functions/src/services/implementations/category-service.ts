import { inject, injectable } from "inversify";
import SERVICE_IDENTIFIER from "../../identifiers";
import { CategoryDTO } from "../../models/dtos/category";
import { Category } from "../../models/repomodels/category";
import { ResponseModel } from "../../models/dtos/responsemodel";
import { ICategoryRepository } from "../../repositories/interfaces/icategory-repository";
import { ICategoryService } from "../interfaces/icategory-service";
import { UtilityService } from "./utility-service";
import { ListDTO } from "../../models/dtos/listdto";
import { QuestionDTO } from "../../models/dtos/questiondto";
import { IQuestionRepository } from "../../repositories/interfaces/iquestion-repository";

@injectable()
export class CategoryService implements ICategoryService {
    constructor(
        /** Category Repository */
        @inject(SERVICE_IDENTIFIER.CategoryRepository)
        private categoryRepository:ICategoryRepository,
        
        /** Qestion Repository */
        @inject(SERVICE_IDENTIFIER.QuestionRepository)
        private questionRepository:IQuestionRepository
    ){}

    /**
     * 
     * @param Category Object
     * @returns  Created Category
     */
    async createCategory(CategoryDTO: CategoryDTO): Promise<ResponseModel<CategoryDTO>> {
        const response = new ResponseModel<CategoryDTO>()
        try{
            let categoryObject = new Category()
            categoryObject = UtilityService.DataCopier(categoryObject,CategoryDTO)
            /** Add/Save Category  */
            let result: Category = await this.categoryRepository.add(categoryObject)
            /** Update Category Id By key */
            result = await this.categoryRepository.update(result)
            response.setSuccessAndData(result,'category create successful')
        }catch(err){response.setServerError(err)}
        return response
    }

    /**
     * 
     * @param page number
     * @param limit number
     * @returns Category List.
     */
    async getAllCategory(page:number,limit:number): Promise<ResponseModel<ListDTO<CategoryDTO>>> {
        const response = new ResponseModel<ListDTO<CategoryDTO>>()
        try{  
            let categorys: Category[] = await this.categoryRepository.getAllByPagination(page,limit)
            
            let listdto = new ListDTO<CategoryDTO>();
            categorys.forEach((item: CategoryDTO) => {
                let singleEntity = new CategoryDTO()
                singleEntity = UtilityService.DataCopier(item,singleEntity)
                listdto.list.push(item);
            })
            /**Update page number and category count in ListDTO */
            listdto.page = page;
            listdto.size = categorys.length;

            response.setSuccessAndData(listdto,'')
        }catch(err){response.setServerError(err)}
        return response       
    }

    /**
     * 
     * @param id string 
     * @returns The Category Object or `Error` if the id is not found.
     */
    async getCategory(id: string): Promise<ResponseModel<CategoryDTO>> {
        const response = new ResponseModel<CategoryDTO>()
        try{
            let category: Category = await this.categoryRepository.get(id)
            if(category) {
                response.setSuccessAndData(category,'')
            }else{
                response.setError('Category Is Not Found')
            }
        }catch(err){response.setServerError(err)}

        return response   
    }

    /**
     * 
     * @param category Object
     * @returns  Category or `Error` if the id is not found.
     */
    async updateCategory(category: CategoryDTO): Promise<ResponseModel<CategoryDTO>> {
        const response = new ResponseModel<CategoryDTO>()
        try{      
            let categoryObject: Category = await this.categoryRepository.get(category.id);
            if(!categoryObject) {
                response.setError('Category Is Not Found')
            }else{
                let singleEntity = new Category()
                singleEntity = UtilityService.DataCopier(category,categoryObject)
                singleEntity.createdOnDate = category.createdOnDate
                /** Update Category */
                let result:CategoryDTO = await this.categoryRepository.update(singleEntity)
                response.setSuccessAndData(result,'Successful Category Update')
            }
        }catch(err){response.setServerError(err)}
        return response     
    }

    /**
     * 
     * @param categoryId String
     * @returns Question or `Error` if (Category OR Root Qestion) Id is not found
     */
    async getRootQuestion(categoryId:string): Promise<ResponseModel<QuestionDTO>>{
        const response =  new ResponseModel<QuestionDTO>()
        try{
            let category: Category = await this.categoryRepository.get(categoryId)
            if(!category) {
                response.setError('Category Is Not Found')
            }else{
                /**Get Qestion Ref In Category Root Qestion Id */
                let question =  await this.questionRepository.get(category.rootQuestionId);
                if(!question){ response.setError('Question Is Not Found') }
                else{ response.setSuccessAndData(question,"")}
            }

        }catch(err){
            response.setServerError(err)
        }
        return response
    }
}