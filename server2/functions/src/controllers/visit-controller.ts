import SERVICE_IDENTIFIER from "../identifiers";
import { resolve } from "../dependencymanagement";
import { AuthenticationService } from "../services/implementations/authentication-service";
import { ResponseModel } from "../models/dtos/responsemodel";
import { VisitDTO } from "../models/dtos/visitdto";

import { IVisitService } from "../services/interfaces/ivisit-service";
import { VisitAnswerDTO } from "../models/dtos/visitanswerdto";
// import { ListDTO } from '../models/dtos/listdto';

var express = require("express");
var router = express.Router();

function getVisitService(): IVisitService {
  return resolve<IVisitService>(SERVICE_IDENTIFIER.VisitService);
}

const visitService = getVisitService();

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

// create visit done
router.post("/", async (req: any, res: any) => {
  let visit: VisitDTO = req.body;
  let result: ResponseModel<VisitDTO> = await visitService.create(visit);
  res.send(result);
});

 
// get visit 
router.get("/:id", async (req: any, res: any) => {
  const visitId: string = req.params.id
  let result: ResponseModel<VisitDTO> = await visitService.getVisit(visitId)
  res.send(result);
});

// create  visit answer done
router.post("/:visitId/:questionID/:optionId", async (req: any, res: any) => {
  const visitID : string = req.params.visitId
  const questionID : string = req.params.questionID
  const optionId : string = req.params.optionId
  let result: ResponseModel<VisitAnswerDTO> = await visitService.createAnswer(visitID , questionID , optionId);
  res.send(result);
});

 
// get visit answer  done
// router.get("/:id", async (req: any, res: any) => {
//   const answerId: string = req.params.id
//   let result: ResponseModel<VisitAnswerDTO> = await visitService.getAnswer(answerId)
//   res.send(result);
// });





module.exports = router;
