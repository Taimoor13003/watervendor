import SERVICE_IDENTIFIER from "../identifiers";
import { resolve } from "../dependencymanagement";
import { IQuestionService } from "../services/interfaces/iquestion-service";
import { AuthenticationService } from "../services/implementations/authentication-service";
import { ResponseModel } from "../models/dtos/responsemodel";
import { QuestionDTO } from "../models/dtos/questiondto";
// import { ListDTO } from '../models/dtos/listdto';

var express = require("express");
var router = express.Router();

function getQuestionService(): IQuestionService {
  return resolve<IQuestionService>(SERVICE_IDENTIFIER.QuestionService);
}
const questionService = getQuestionService();

const authenticationService = new AuthenticationService();
router.use(async function (req: any, res: any, next: any) {
  console.log("ROUTER MIDDLEWARE");
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

// done
router.post("/", async (req: any, res: any) => {
  let question: QuestionDTO = req.body;
  let result: ResponseModel<QuestionDTO> = await questionService.create(question);
  res.send(result);
});

 
// get question 
router.get("/:id", async (req: any, res: any) => {
  const questionId: string = req.params.id
  let result: ResponseModel<QuestionDTO> = await questionService.getQuestion(questionId)
  res.send(result);
});





module.exports = router;
