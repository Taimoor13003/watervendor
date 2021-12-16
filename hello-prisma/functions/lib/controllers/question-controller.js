"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const identifiers_1 = require("../identifiers");
const dependencymanagement_1 = require("../dependencymanagement");
const authentication_service_1 = require("../services/implementations/authentication-service");
// import { ListDTO } from '../models/dtos/listdto';
var express = require("express");
var router = express.Router();
function getQuestionService() {
    return (0, dependencymanagement_1.resolve)(identifiers_1.default.QuestionService);
}
const questionService = getQuestionService();
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
// done
router.post("/", async (req, res) => {
    let question = req.body;
    let result = await questionService.create(question);
    res.send(result);
});
// get question 
router.get("/:id", async (req, res) => {
    const questionId = req.params.id;
    let result = await questionService.getQuestion(questionId);
    res.send(result);
});
module.exports = router;
//# sourceMappingURL=question-controller.js.map