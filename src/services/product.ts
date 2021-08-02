import { validateOrReject } from "class-validator";
import { getRepository } from "typeorm";
import { Product } from "../entities";
import { ELevel, ESize } from "../entities/Product";

export interface IGetProductsPayload {
  page: number;
  limit: number;
  where?: { [name: string]: string };
}

export interface IGetProductsReturn {
  products: Product[];
  next: boolean;
}

export const getProducts = async (
  paginationOptions: IGetProductsPayload
): Promise<IGetProductsReturn> => {
  const { limit, page, where } = paginationOptions;
  const productRepository = getRepository(Product);
  const products = await productRepository.find({
    where,
    take: limit + 1,
    skip: page * limit,
  });
  const next = products.length === limit + 1;
  return { products: products.slice(0, limit), next };
};

export const getProduct = async (
  id: number
): Promise<Product | null> => {
  const productRepository = getRepository(Product);
  const product = await productRepository.findOne({ id });
  return product || null;
};

export interface ICreateProductpayload {
  name: string;
  description: string;
  longDescription: string;
  price: number;
  discount?: number;
  countInStock: number;
  watering: ELevel;
  light: ELevel;
  size: ESize;
  temp: number;
  sold?: number;
}

export const createProduct = async ({
  countInStock,
  description,
  light,
  longDescription,
  name,
  price,
  size,
  temp,
  watering,
  discount,
  sold,
}: ICreateProductpayload): Promise<Product | null> => {
  const productRepository = getRepository(Product);
  const product = new Product();
  product.name = name;
  product.description = description;
  product.longDescription = longDescription;
  product.price = price;
  product.countInStock = countInStock;
  product.discount = discount || 0;
  product.watering = watering;
  product.light = light;
  product.size = size;
  product.temp = temp;
  product.sold = sold || 0;

  await validateOrReject(product);

  return productRepository.save(product);
};
