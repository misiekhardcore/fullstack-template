import { NextFunction, Request, Response, Router } from "express";
import { validationResult } from "express-validator";
import passport from "passport";
import { ValidateError } from "tsoa";
import { UserController } from "../controllers/user";

const router = Router();

router.get(
  "/users/",
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const controller = new UserController();
    const response = await controller.getUsers();
    return res.send(response);
  }
);

router.get("/users/:id", async (req: Request, res: Response) => {
  const controller = new UserController();
  const response = await controller.getUser(Number(req.params.id));
  return res.send(response);
});

router.post(
  "/users/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.send(errors.array());
      const controller = new UserController();
      const response = await controller.login(req.body);
      if (response instanceof ValidateError) throw response;
      return res
        .header({ Authorization: `JWT ${response.id}` })
        .send(response);
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/users/register",
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.send(errors.array());
    const controller = new UserController();
    try {
      await controller.register(req.body);
      return res.status(201).send({
        success: true,
        messgae: "Account created, please verify your email",
      });
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  "/users/verify-account/:verificationCode",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const controller = new UserController();
      const response = await controller.verificateCode(
        req.params.verificationCode
      );
      return res.send(response);
    } catch (error) {
      return next(error);
    }
  }
);

router.get("/users/authenticate", () => {});

export default router;
