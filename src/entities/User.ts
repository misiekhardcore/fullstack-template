import argon2 from "argon2";
import { IsEmail } from "class-validator";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { pick } from "lodash";
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserAddress } from "./Address";

export type TJWTPayload = Pick<
  User,
  "id" | "username" | "email" | "verified"
>;

export type TPartialUser = {
  id: number;
  email: string;
  username: string;
  verified: boolean;
};

/**
 * User model for the database
 */
@Entity({ name: "users" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username: string;

  @Column({ type: "text", nullable: true })
  firstName: string | null;

  @Column({ type: "text", nullable: true })
  lastName: string | null;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ select: false })
  password: string;

  @OneToOne((_type) => UserAddress, {
    nullable: true,
    onDelete: "CASCADE",
  })
  address: UserAddress;

  @Column({ default: false })
  verified: boolean;

  @Column({ type: "text", nullable: true })
  verificationCode: string | null;

  @Column({ type: "text", nullable: true })
  resetPasswordToken: string;

  @Column({ default: new Date() })
  resetPasswordExp: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  // @BeforeUpdate()
  async hashPassword(): Promise<void> {
    this.password = await argon2.hash(this.password);
  }

  @BeforeInsert()
  async verificationCodeGen(): Promise<void> {
    this.verificationCode = randomBytes(20).toString("hex");
  }

  async comparePassword(password: string): Promise<boolean> {
    return await argon2.verify(this.password, password);
  }

  generateJWT(): string {
    const payload: TJWTPayload = {
      username: this.username,
      email: this.email,
      id: this.id,
      verified: this.verified,
    };
    return (
      "JWT " +
      jwt.sign(payload, process.env.SECRET || "secret", {
        expiresIn: "1 day",
      })
    );
  }

  generatePasswordReset() {
    this.resetPasswordExp = new Date(Date.now() + 36000000);
    this.resetPasswordToken = randomBytes(20).toString("hex");
  }

  getUserInfo(): TPartialUser {
    return pick(this, ["id", "username", "email", "verified"]);
  }
}
