import { Body, Get, Path, Post, Route, Tags } from "tsoa";
import { Product } from "../entities";
import {
  createProduct,
  getProduct,
  getProducts,
  ICreateProductpayload,
  IGetProductsPayload,
  IGetProductsReturn,
} from "../services/product";

@Route("products")
@Tags("Product")
export class ProductController {
  @Post("/")
  public async getProducts(
    @Body() payload: IGetProductsPayload
  ): Promise<IGetProductsReturn> {
    return getProducts(payload);
  }

  @Get("/:id")
  public async getProduct(@Path() id: string): Promise<Product | null> {
    console.log(id);
    return getProduct(Number(id));
  }

  @Post("/create")
  public async createProduct(
    @Body() payload: ICreateProductpayload
  ): Promise<Product | null> {
    return createProduct(payload);
  }
}
