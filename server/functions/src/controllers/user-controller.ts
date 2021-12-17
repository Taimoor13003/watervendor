import SERVICE_IDENTIFIER from "../identifiers";
import { resolve } from "../dependencymanagement";
import { User } from "../models/repomodels/user";
import { IUserService } from "../services/interfaces/iuser-service";
import { AuthenticationService } from "../services/implementations/authentication-service";
import { UserDTO } from "../models/dtos/userdto";
import { RegisterDeviceDTO } from "../models/dtos/registerdevicedto";
import { IRemoveDeviceRequestModel } from "../models/dtos/iremovedevicemodel";
import { ListDTO } from "../models/dtos/listdto";
import { ResponseModel } from "../models/dtos/responsemodel";
import { UserListDTO } from "../models/dtos/userlistdto";

var express = require("express");
var router = express.Router();

function getUserService(): IUserService {
  return resolve<IUserService>(SERVICE_IDENTIFIER.UserService);
}
const userService = getUserService();

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
router.post("/device", async (req: any, res: any) => {
  let data: RegisterDeviceDTO = req.body;
  // UserId M
  data.userId = req.userId;
  let result = await userService.registerUserDevice(data);
  res.send(result);
});
// done
router.delete("/device", async (req: any, res: any) => {
  let data: IRemoveDeviceRequestModel = req.body;
  // UserId M
  data.UserId = req.userId;

  let result = await userService.unregisterUserDevice(data);
  res.send(result);
});

// done
router.post("/signup", async (req: any, res: any) => {
  let signupUser: User = req.body;
  let result: ResponseModel<UserDTO> = await userService.signUp(
    signupUser,
    req.userId
  );
  res.send(result);
});

router.get("/", async (req: any, res: any) => {
  const page: number = req.query.page || 1;
  const count: number = req.query.count || req.query.limit || 10;

  let result: ResponseModel<ListDTO<UserListDTO>> =
    await userService.getAllByPagination(page, count, req.params.keyword);
  res.send(result);
});

router.get("/keyword/:keyword", async (req: any, res: any) => {
  const page: number = req.query.page || 1;
  const count: number = req.query.count || req.query.limit || 10;

  let result: ResponseModel<ListDTO<UserListDTO>> =
    await userService.getAllByPagination(page, count, req.params.keyword);
  res.send(result);
});
// done
router.put("/", async (req: any, res: any) => {
  let user: UserDTO = req.body;
  let result: ResponseModel<User> = await userService.update(user, req.userId);
  res.send(result);
});
// done
router.get("/signin", async (req: any, res: any) => {
  let result: ResponseModel<UserDTO> = await userService.signIn(req.userId);
  res.send(result);
});

router.get("/detail/:id", async (req: any, res: any) => {
  let result: ResponseModel<UserDTO> = await userService.findOne(req.params.id);
  res.send(result);
});

module.exports = router;
