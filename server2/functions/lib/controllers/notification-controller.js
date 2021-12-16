"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const identifiers_1 = require("../identifiers");
const dependencymanagement_1 = require("../dependencymanagement");
const authentication_service_1 = require("../services/implementations/authentication-service");
// import { ResponseModel } from "../models/dtos/responsemodel";
var express = require('express');
var router = express.Router();
function getPostService() {
    return dependencymanagement_1.resolve(identifiers_1.default.NotificationService);
}
const notiicationService = getPostService();
const authenticationService = new authentication_service_1.AuthenticationService();
// let response: ResponseModel<Notification> =
//     new ResponseModel<Notification>();
router.use(async function (req, res, next) {
    console.log("ROUTER MIDDLEWARE");
    authenticationService.authenticate(req).then((r) => {
        if (r) {
            next();
            return;
        }
        else {
            res.status(401).send("Unauthorized");
            return;
        }
    }).catch((err) => {
        console.log(err.message);
        res.status(401).send("Unauthorized");
        return;
    });
});
router.post("/", async (req, res) => {
    let data = req.body;
    let result = await notiicationService.addnotification(data);
    res.send(result);
});
router.delete("/", async (req, res) => {
    let result = await notiicationService.deltePost(req.query.id);
    res.send(result);
});
router.get("/", async (req, res) => {
    let result = await notiicationService.getnotification(req.query.id);
    res.send(result);
});
module.exports = router;
//# sourceMappingURL=notification-controller.js.map