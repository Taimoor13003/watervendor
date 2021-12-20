import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as bodyParser from "body-parser";
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require('swagger-jsdoc');
// import { PrismaClient } from '@prisma/client'



admin.initializeApp(functions.config().firebase);

const app = express();
const cors = require("cors");
const main = express();
main.use("/water-vendor/api/v1/", app);
main.use(bodyParser.json());

var userController = require('./controllers/user-controller');
// var categoryController = require('./controllers/category-controller');
// var questionController = require('./controllers/question-controller');
// var visitController = require('./controllers/visit-controller');


app.get("/token", async (req: any, res: any) => {
  admin.auth().createCustomToken("35cisTue1mYV8gW7h4pOxz9lZ6q1").then((customToken) => {
    res.send(customToken);
  })
    .catch((error) => {
      console.log('Error creating custom token:', error);
    });
});

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "library api",
      version: "1.0.0",
      description: "A simple vendor api",
    },
    servers: [{
      url: "http://localhost:5000/water-vendor/api/v1"
    }]

  },
  apis: ["index.ts"]
}

const specs = swaggerJsDoc(options)


app.use(cors({ origin: true }));

export const waterVendor = functions.https.onRequest(main);


app.use("/user", userController);
// app.use("/category", categoryController);
// app.use("/question", questionController);
// app.use("/visit", visitController);


// Swagger
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));






// const prisma = new PrismaClient()

// async function main2() {

  // const post = await prisma.post.update({
  //   where: { id: 1 },
  //   data: { published: false },
  // })
  // console.log(post)

  // return

  // await prisma.user.create({
  //   data: {
  //     name: 'Alice',
  //     email: 'alice@prisma.io',
  //     posts: {
  //       create: { title: 'Hello World' },
  //     },
  //     profile: {
  //       create: { bio: 'I like turtles' },
  //     },
  //   },
  // })

  // const allUsers = await prisma.user.findMany({
  //   include: {
  //     posts: true,
  //     profile: true,
  //   },
  // })
  // console.dir(allUsers, { depth: null })

// }

// main2()
//   .catch((e) => {
//     throw e
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })

