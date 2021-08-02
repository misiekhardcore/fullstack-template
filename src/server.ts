import { config } from "dotenv";
import express, {
  Application,
  NextFunction,
  Request,
  Response,
} from "express";
import morgan from "morgan";
import "reflect-metadata";
import swaggerUi from "swagger-ui-express";
import { ValidateError } from "tsoa";
import { createConnection } from "typeorm";
import dbConfig from "./config/database";
import { RegisterRoutes } from "./routes/routes";
// import userRouter from "./routes/user";
// import productRouter from "./routes/product";
import passport from "passport";
import { authenticateUser } from "./middlewares/auth";
// import "./middlewares/authentication";

//run dotenv config
config();

//get PORT from .env
const PORT = process.env.PORT || 4000;

//create express app
const app: Application = express();

//set basic middlewares
app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("public"));
authenticateUser(passport);
app.use(passport.initialize());

//create TSOA specs and routes
// (async () => {
//   const specOptions: ExtendedSpecConfig = {
//     entryFile: "src/server.ts",
//     specVersion: 3,
//     outputDirectory: "public",
//     controllerPathGlobs: ["src/controllers/**/*.ts"],
//     noImplicitAdditionalProperties: "throw-on-extras",
//   };

//   const routeOptions: ExtendedRoutesConfig = {
//     entryFile: "src/server.ts",
//     routesDir: "src/routes",
//     noImplicitAdditionalProperties: "throw-on-extras",
//   };

//   await generateSpec(specOptions);

//   await generateRoutes(routeOptions);
// })();

//prepare Swagger endpoint
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);

//use TSOA generated router
RegisterRoutes(app);
// app.use(userRouter);
// app.use(productRouter);

//handle validation errors
app.use(function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  if (err instanceof ValidateError) {
    console.warn(
      `Caught Validation Error for ${req.path}:`,
      err.fields
    );
    return res.status(err.status || 422).json({
      message: err.message || "Validation Failed",
      details: err.fields,
    });
  }
  if (err instanceof Error) {
    console.warn(`Caught Validation Error for ${req.path}:`, err);
    return res.status(500).json({
      message: "Internal Server Error",
      details: err.message,
    });
  }

  next();
});

// //handle missing urls
// app.use(function notFoundHandler(_req, res: Response) {
//   res.status(404).send({
//     message: "Not Found",
//   });
// });

//create typeorm connection and run server
createConnection(dbConfig)
  .then((_connection) => {
    app.listen(PORT, () => {
      console.log("Server is running on", PORT);
    });
  })
  .catch((error) => {
    console.log("Unable to connect to db", error);
    process.exit(1);
  });
