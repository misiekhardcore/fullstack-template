import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { OrderItem } from "./OrderItem";

@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(
    (_type) => OrderItem,
    (orderItem: OrderItem) => orderItem.order,
    { cascade: true, onDelete: "CASCADE" }
  )
  orderItems!: OrderItem[];

  @Column({ nullable: true })
  street!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
