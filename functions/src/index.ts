import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as bodyParser from "body-parser";

admin.initializeApp(functions.config().firebase);

const app = express();
const cors = require("cors");
const main = express();
main.use("/water-vendor/api/v1/", app);
main.use(bodyParser.json());

var userController = require('./controllers/user-controller');
var categoryController = require('./controllers/category-controller');
var questionController = require('./controllers/question-controller');
var visitController = require('./controllers/visit-controller');


app.get("/token", async (req: any, res: any) => {
  admin.auth().createCustomToken("35cisTue1mYV8gW7h4pOxz9lZ6q1").then((customToken) => {
    res.send(customToken);
  })
    .catch((error) => {
      console.log('Error creating custom token:', error);
    });
});

app.use(cors({ origin: true }));

export const waterVendor = functions.https.onRequest(main);

app.use("/user", userController);
app.use("/category", categoryController);
app.use("/question", questionController);
app.use("/visit", visitController);
