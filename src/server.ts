import { config } from "dotenv";
import express, {
  Application,
  NextFunction,
  Request,
  Response,
} from "express";
import morgan from "morgan";
import passport from "passport";
import { join } from "path";
import "reflect-metadata";
import swaggerUi from "swagger-ui-express";
import { ValidateError } from "tsoa";
import { createConnection } from "typeorm";
import dbConfig from "./config/database";
import { authenticateUser } from "./middlewares/auth";
import { RegisterRoutes } from "./routes/routes";

// Run dotenv config
config();

// Get PORT from .env
const PORT = process.env.PORT || 4000;

// Create express app
const app: Application = express();

// Set basic middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// Prepare Swagger endpoint
app.use(
  "/docs/api",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);

// Use TSOA generated router
RegisterRoutes(app);

// Serve JSDoc files
app.use("/docs/code", express.static(join(__dirname, "../out")));

// Serve React app
app.use(express.static(join(__dirname, "..", "frontend/build")));
// app.use((_, res, __) => {
//   res.sendFile(join(__dirname, "..", "frontend/build", "index.html"));
// });

// Handle errors
app.use(function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  // Catch ValidateErrors
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
  // Catch normal Errors
  if (err instanceof Error) {
    console.warn(`Caught Validation Error for ${req.path}:`, err);
    return res.status(500).json({
      message: "Internal Server Error",
      details: err.message,
    });
  }

  next();
});

// // Handle missing URLs
// app.use(function notFoundHandler(_req, res: Response) {
//   res.status(404).send({
//     message: "Not Found",
//   });
// });

// Create TypeORM connection and run server
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
