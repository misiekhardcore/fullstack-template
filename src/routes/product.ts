import { Router } from "express";
import { Request, Response } from "express-serve-static-core";
import { ProductController } from "../controllers/product";

const router = Router();

router.post("/products/", async (req: Request, res: Response) => {
  const controller = new ProductController();
  const response = await controller.getProducts(req.body);
  return res.send(response);
});

router.get("/products/:id", async (req: Request, res: Response) => {
  const controller = new ProductController();
  const response = await controller.getProduct(req.params.id);
  return res.send(response);
});

router.post("/products/", async (req: Request, res: Response) => {
  const controller = new ProductController();
  const response = await controller.createProduct(req.body);
  return res.send(response);
});

export default router;
