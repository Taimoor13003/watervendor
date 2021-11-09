import { CategoryDTO } from "../../models/dtos/category";
import { ListDTO } from "../../models/dtos/listdto";
import { QuestionDTO } from "../../models/dtos/questiondto";
import { ResponseModel } from "../../models/dtos/responsemodel";

export interface ICategoryService {

  /**
   * Adds new Category
   * @param Category Object
   */
  createCategory(Category: CategoryDTO): Promise<ResponseModel<CategoryDTO>>;

  /**
   * 
   * @param page number
   * @param limit number
   */
   getAllCategory(page:number,limit:number): Promise<ResponseModel<ListDTO<CategoryDTO>>>;

  /**
   * Get One Category By Id
   * @param string Category Id to Get One
   */
  getCategory(id: string): Promise<ResponseModel<CategoryDTO>>;

  /**
   * update Category By Id
   * @param Category Object
   */
  updateCategory(Category: CategoryDTO): Promise<ResponseModel<CategoryDTO>>;

  /**
   * 
   * @param categoryId String
   */
  getRootQuestion(categoryId:string) :Promise<ResponseModel<QuestionDTO>>
}
