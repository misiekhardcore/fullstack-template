import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Order } from "./Order";
import { Product } from "./Product";

@Entity()
export class OrderItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne((_type) => Order, (order: Order) => order.orderItems)
  @JoinColumn()
  order!: Order;

  @ManyToOne((_type) => Product, (product: Product) => product.id)
  @JoinColumn()
  product!: Product;

  @Column()
  quantity: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
