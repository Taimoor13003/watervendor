"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const identifiers_1 = require("../identifiers");
const dependencymanagement_1 = require("../dependencymanagement");
const authentication_service_1 = require("../services/implementations/authentication-service");
var express = require("express");
var router = express.Router();
function getUserService() {
    return dependencymanagement_1.resolve(identifiers_1.default.UserService);
}
const userService = getUserService();
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
router.post("/device", async (req, res) => {
    let data = req.body;
    // UserId M
    data.userId = req.userId;
    let result = await userService.registerUserDevice(data);
    res.send(result);
});
// done
router.delete("/device", async (req, res) => {
    let data = req.body;
    // UserId M
    data.UserId = req.userId;
    let result = await userService.unregisterUserDevice(data);
    res.send(result);
});
// done
router.post("/signup", async (req, res) => {
    let signupUser = req.body;
    let result = await userService.signUp(signupUser, req.userId);
    res.send(result);
});
router.get("/", async (req, res) => {
    const page = req.query.page || 1;
    const count = req.query.count || req.query.limit || 10;
    let result = await userService.getAllByPagination(page, count, req.params.keyword);
    res.send(result);
});
router.get("/keyword/:keyword", async (req, res) => {
    const page = req.query.page || 1;
    const count = req.query.count || req.query.limit || 10;
    let result = await userService.getAllByPagination(page, count, req.params.keyword);
    res.send(result);
});
// done
router.put("/", async (req, res) => {
    let user = req.body;
    let result = await userService.update(user, req.userId);
    res.send(result);
});
// done
router.get("/signin", async (req, res) => {
    let result = await userService.signIn(req.userId);
    res.send(result);
});
router.get("/detail/:id", async (req, res) => {
    let result = await userService.findOne(req.params.id);
    res.send(result);
});
module.exports = router;
//# sourceMappingURL=user-controller.js.map