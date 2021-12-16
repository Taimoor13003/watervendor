"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waterVendor = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require("body-parser");
admin.initializeApp(functions.config().firebase);
const app = express();
const cors = require("cors");
const main = express();
main.use("/water-vendor/api/v1/", app);
main.use(bodyParser.json());
// var userController = require('./controllers/user-controller');
// var categoryController = require('./controllers/category-controller');
// var questionController = require('./controllers/question-controller');
// var visitController = require('./controllers/visit-controller');
app.get("/token", async (req, res) => {
    admin.auth().createCustomToken("35cisTue1mYV8gW7h4pOxz9lZ6q1").then((customToken) => {
        res.send(customToken);
    })
        .catch((error) => {
        console.log('Error creating custom token:', error);
    });
});
app.use(cors({ origin: true }));
exports.waterVendor = functions.https.onRequest(main);
const client_1 = require("@prisma/client");
// @ts-ignore
const prisma = new client_1.PrismaClient();
app.post("/", async (req) => {
    const users = await prisma.user.findMany();
    console.log(users, "usersssssssssss");
    console.log(req.body);
});
// app.use("/user", userController);
// app.use("/category", categoryController);
// app.use("/question", questionController);
// app.use("/visit", visitController);
// DATABASE_URL="mysql://khan1972:SanaTax@7262@a2plcpnl0463.prod.iad2.secureserver.net:3306/wbms"
// username : wbms_user1
// pass : wbmsu1786@
// DATABASE_UR="mysql://johndoe:randompassword@localhost:5432/mydb?schema=public"
// <!-- production -->
// DATABASE_URLq ="postgres://muvbljyv:YrHkIrnA1nrKHwnJUkCK2EcpkprfZNqm@fanny.db.elephantsql.com/muvbljyv"
// <!-- development -->
// DATABASE_URL ="postgres://postgres:taimoor@localhost:5432/wbms?schema=public"
//# sourceMappingURL=index.js.map