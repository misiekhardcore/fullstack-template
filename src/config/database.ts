import { ConnectionOptions } from "typeorm";
import {
  User,
  Rating,
  Product,
  Comment,
  OrderItem,
  Order,
  Address,
} from "../entities";

const config: ConnectionOptions = {
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  database: process.env.POSTGRES_DB || "template",
  entities: [User, Comment, Rating, Product, Order, OrderItem, Address],
  synchronize: true,
};

export default config;
