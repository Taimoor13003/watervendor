"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const identifiers_1 = require("../identifiers");
const dependencymanagement_1 = require("../dependencymanagement");
const authentication_service_1 = require("../services/implementations/authentication-service");
var express = require("express");
var router = express.Router();
function getCategoryService() {
    return dependencymanagement_1.resolve(identifiers_1.default.CategoryService);
}
const categoryService = getCategoryService();
const authenticationService = new authentication_service_1.AuthenticationService();
router.use(async function (req, res, next) {
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
// get category 
router.get("/:id", async (req, res) => {
    const categoryId = req.params.id;
    let result = await categoryService.getCategory(categoryId);
    res.send(result);
});
// get root question by category id
router.get("/:id/question", async (req, res) => {
    const categoryId = req.params.id;
    let result = await categoryService.getRootQuestion(categoryId);
    res.send(result);
});
// get all category by pagination
router.get("/", async (req, res) => {
    const page = +req.query.page || 1;
    const count = +req.query.limit || 10;
    let result = await categoryService.getAllCategory(page, count);
    res.send(result);
});
// create category
router.post("/", async (req, res) => {
    const category = req.body;
    let result = await categoryService.createCategory(category);
    res.send(result);
});
// update category
router.put("/", async (req, res) => {
    const category = req.body;
    let result = await categoryService.updateCategory(category);
    res.send(result);
});
module.exports = router;
//# sourceMappingURL=category-controller.js.map