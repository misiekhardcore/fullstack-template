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
import { Product } from "./Product";
import { User } from "./User";

@Entity()
export class Rating extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne((_type) => User, (user: User) => user.id)
  @JoinColumn()
  user!: User;

  @ManyToOne((_type) => Product, (product: Product) => product.ratings)
  @JoinColumn()
  product!: Product;

  @Column({ default: 0 })
  rating!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
