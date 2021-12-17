import * as admin from "firebase-admin";
import { injectable } from "inversify";
import { auth } from "google-auth-library";
// import { auth } from "firebase-functions";

@injectable()
export class AuthenticationService {
  public async authenticate(req: any): Promise<boolean> {
    console.log("Check if request is authorized with Firebase ID token");
    // console.log(JSON.stringify(req),"REEEEEEEQUESST HAI");
    console.log("PROJECT ID", auth.getProjectId());
    let idToken;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      console.log('Found "authorization" header');
      // Read the ID Token from the authorization header.
      idToken = req.headers.authorization.split("Bearer ")[1];
      console.log("ID", idToken);
    } else {
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
    } catch (error) {
      console.error("Error while verifying Firebase ID token:", error);
      return false;
    }
  }

  async authenticateAdmin(req: any): Promise<boolean> {
    let idToken;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      console.log('Found "authorization" header');
      // Read the ID Token from the authorization header.
      idToken = req.headers.authorization.split("Bearer ")[1];
    } else {
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
    } catch (error) {
      console.error("Error while verifying Firebase Admin claim:", error);
      return false;
    }
    return false;
  }

  async verifyToken(token: string) {
    return await admin.auth().verifyIdToken(token);
  }

  async addAdminClaim(idToken: string): Promise<boolean> {
    try {
      const userClaims = await admin.auth().verifyIdToken(idToken);
      console.log("Token for claims correctly decoded", userClaims);
      await admin
        .auth()
        .setCustomUserClaims(userClaims.user_id, { admin: true });
      return true;
    } catch (error) {
      console.error(
        "Error while verifying Firebase ID token for claims:",
        error
      );
      return false;
    }
  }
}
