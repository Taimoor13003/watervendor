import SERVICE_IDENTIFIER from "../identifiers";
import { resolve } from "../dependencymanagement";
import { INotificationService } from "../services/interfaces/inotification-service";
import { Notification } from "../models/repomodels/notification";
import { AuthenticationService } from "../services/implementations/authentication-service";
// import { ResponseModel } from "../models/dtos/responsemodel";

var express = require('express');
var router = express.Router(); 
function getPostService(): INotificationService {
    return resolve<INotificationService>(SERVICE_IDENTIFIER.NotificationService);
}
const notiicationService = getPostService();
const authenticationService = new AuthenticationService();
// let response: ResponseModel<Notification> =
//     new ResponseModel<Notification>();
router.use(async function (req: any, res: any, next: any) {
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
router.post("/", async (req: any, res: any) => {
    let data: Notification = req.body;
    let result = await notiicationService.addnotification(data);
    res.send(result);
});
router.delete("/", async (req: any, res: any) => {
    let result = await notiicationService.deltePost(req.query.id);
    res.send(result);
});
router.get("/", async (req: any, res: any) => {
    let result = await notiicationService.getnotification(req.query.id);
    res.send(result);
});
module.exports = router; 
