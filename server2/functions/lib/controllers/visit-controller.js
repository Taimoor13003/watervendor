"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const identifiers_1 = require("../identifiers");
const dependencymanagement_1 = require("../dependencymanagement");
const authentication_service_1 = require("../services/implementations/authentication-service");
// import { ListDTO } from '../models/dtos/listdto';
var express = require("express");
var router = express.Router();
function getVisitService() {
    return dependencymanagement_1.resolve(identifiers_1.default.VisitService);
}
const visitService = getVisitService();
const authenticationService = new authentication_service_1.AuthenticationService();
router.use(async function (req, res, next) {
    console.log("ROUTER MIDDLEWARE");
    authenticationService
        .authenticate(req)
        .then((r) => {
        if (r) {
            next();
            return;
        }
        else {
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
router.post("/", async (req, res) => {
    let visit = req.body;
    let result = await visitService.create(visit);
    res.send(result);
});
// get visit 
router.get("/:id", async (req, res) => {
    const visitId = req.params.id;
    let result = await visitService.getVisit(visitId);
    res.send(result);
});
// create  visit answer done
router.post("/:visitId/:questionID/:optionId", async (req, res) => {
    const visitID = req.params.visitId;
    const questionID = req.params.questionID;
    const optionId = req.params.optionId;
    let result = await visitService.createAnswer(visitID, questionID, optionId);
    res.send(result);
});
// get visit answer  done
// router.get("/:id", async (req: any, res: any) => {
//   const answerId: string = req.params.id
//   let result: ResponseModel<VisitAnswerDTO> = await visitService.getAnswer(answerId)
//   res.send(result);
// });
module.exports = router;
//# sourceMappingURL=visit-controller.js.map