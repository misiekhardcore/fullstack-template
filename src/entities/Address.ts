import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class UserAddress extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne((_type) => User)
  @JoinColumn()
  user!: User;

  @Column({ nullable: true })
  street!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
