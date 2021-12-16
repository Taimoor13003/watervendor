import SERVICE_IDENTIFIER from "../identifiers";
import { resolve } from "../dependencymanagement";
import { AuthenticationService } from "../services/implementations/authentication-service";
import { ICategoryService } from "../services/interfaces/icategory-service";
import { CategoryDTO } from "../models/dtos/category";
import { ListDTO } from "../models/dtos/listdto";
import { ResponseModel } from "../models/dtos/responsemodel";
import { QuestionDTO } from "../models/dtos/questiondto";

var express = require("express");
var router = express.Router();

function getCategoryService(): ICategoryService {
  return resolve<ICategoryService>(SERVICE_IDENTIFIER.CategoryService);
}
const categoryService = getCategoryService();

const authenticationService = new AuthenticationService();
router.use(async function (req: any, res: any, next: any) {
  authenticationService
    .authenticate(req)
    .then((r) => {
      if (r) {
        next();
        return;
      } else {
        res.status(401).send("Unauthorized");
        return;
      }
    })
    .catch((err) => {
      console.log(err.message);
      res.status(401).send("Unauthorized");
      return;
    });
});



// get category 
router.get("/:id", async (req: any, res: any) => {
  const categoryId: string = req.params.id
  let result: ResponseModel<CategoryDTO> = await categoryService.getCategory(categoryId)
  res.send(result);
});

// get root question by category id
router.get("/:id/question", async (req: any, res: any) => {
  const categoryId: string = req.params.id
  let result: ResponseModel<QuestionDTO> = await categoryService.getRootQuestion(categoryId)
  res.send(result);
});

// get all category by pagination
router.get("/", async (req: any, res: any) => {
  const page: number = +req.query.page || 1;
  const count: number = +req.query.limit || 10;

  let result: ResponseModel<ListDTO<CategoryDTO>> = await categoryService.getAllCategory(page, count);
  res.send(result);
});

// create category
router.post("/", async (req: any, res: any) => {
  const category: CategoryDTO = req.body
  let result: ResponseModel<CategoryDTO> = await categoryService.createCategory(category);
  res.send(result);
});

// update category
router.put("/", async (req: any, res: any) => {
  const category: CategoryDTO = req.body
  let result: ResponseModel<CategoryDTO> = await categoryService.updateCategory(category);
  res.send(result);
});


module.exports = router;
