"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
const admin = require("firebase-admin");
const inversify_1 = require("inversify");
const google_auth_library_1 = require("google-auth-library");
// import { auth } from "firebase-functions";
let AuthenticationService = class AuthenticationService {
    async authenticate(req) {
        console.log("Check if request is authorized with Firebase ID token");
        // console.log(JSON.stringify(req),"REEEEEEEQUESST HAI");
        console.log("PROJECT ID", google_auth_library_1.auth.getProjectId());
        let idToken;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")) {
            console.log('Found "authorization" header');
            // Read the ID Token from the authorization header.
            idToken = req.headers.authorization.split("Bearer ")[1];
            console.log("ID", idToken);
        }
        else {
            return false;
        }
        try {
            console.log(idToken);
            console.log(admin.auth());
            const userClaims = await admin.auth().verifyIdToken(idToken);
            console.log("ID Token correctly decoded", userClaims.user_id);
            // let id: string = userClaims.user_id;
            // let user:User=await this.userRepository.get(id);
            // this.userInfo.user=user;
            // this.userInfo.token=idToken;
            req.userId = userClaims.user_id;
            return true;
            // const userService = new UserService(
            //   { email: req.body.email, userId: req.body.id },
            //   new DataService()
            // );
            // req.userService = userService;
            // return true;
        }
        catch (error) {
            console.error("Error while verifying Firebase ID token:", error);
            return false;
        }
    }
    async authenticateAdmin(req) {
        let idToken;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")) {
            console.log('Found "authorization" header');
            // Read the ID Token from the authorization header.
            idToken = req.headers.authorization.split("Bearer ")[1];
        }
        else {
            return false;
        }
        console.log("Check if request is authorized with admin token");
        try {
            await admin.auth().verifyIdToken(idToken);
            const userClaims = await admin.auth().verifyIdToken(idToken);
            console.log("ID Token correctly decoded", userClaims);
            if (userClaims.admin) {
                return true;
            }
        }
        catch (error) {
            console.error("Error while verifying Firebase Admin claim:", error);
            return false;
        }
        return false;
    }
    async verifyToken(token) {
        return await admin.auth().verifyIdToken(token);
    }
    async addAdminClaim(idToken) {
        try {
            const userClaims = await admin.auth().verifyIdToken(idToken);
            console.log("Token for claims correctly decoded", userClaims);
            await admin
                .auth()
                .setCustomUserClaims(userClaims.user_id, { admin: true });
            return true;
        }
        catch (error) {
            console.error("Error while verifying Firebase ID token for claims:", error);
            return false;
        }
    }
};
AuthenticationService = __decorate([
    inversify_1.injectable()
], AuthenticationService);
exports.AuthenticationService = AuthenticationService;
//# sourceMappingURL=authentication-service.js.map