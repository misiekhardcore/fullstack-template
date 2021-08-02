import argon2 from "argon2";
import { IsEmail, Length, Min } from "class-validator";
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
 * @class
 * @classdesc User model for the database
 * @property {number} id numeric id from autoincremental primary key column
 * @property {string} username username
 * @property {string|null} firstName firstname
 * @property {string|null} lastName lastname
 * @property {string} email email address
 * @property {UserAddress|null} address address information
 * @property {boolean} verified User id
 * @property {string|null} verificationCode User id
 * @property {string|null} resetPasswordToken User id
 * @property {Date} resetPasswordExp User id
 * @property {Date} createdAt User id
 * @property {Date} updatedAt User id
 */
@Entity({ name: "users" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Length(6, 30)
  username: string;

  @Column({ type: "text", nullable: true })
  @Length(1, 30)
  firstName: string | null;

  @Column({ type: "text", nullable: true })
  @Length(1, 30)
  lastName: string | null;

  @Column({ unique: true })
  @Length(1, 60)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Min(6)
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

  /**
   * Hashes users password with argon2 algorithm. Runs automatically before new user creation
   */
  @BeforeInsert()
  // @BeforeUpdate()
  async hashPassword(): Promise<void> {
    this.password = await argon2.hash(this.password);
  }

  /**
   * Generates verification code for every new user. Code is sent by email to verify new user account
   */
  @BeforeInsert()
  async verificationCodeGen(): Promise<void> {
    this.verificationCode = randomBytes(20).toString("hex");
  }

  /**
   * Checks if sent plain password matches encrypted one
   * @param {string} password plain password to check with encrypted password from database
   * @returns {boolean} Returns with true if password is correct
   */
  async comparePassword(password: string): Promise<boolean> {
    return await argon2.verify(this.password, password);
  }

  /**
   * Generates JWT token for login request
   * @returns {string} JWT token with encoded basic user info
   */
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

  /**
   * Generates resetPasswordToken whitch is used to reset users password. Sets reset token expiration time
   */
  generatePasswordReset() {
    this.resetPasswordExp = new Date(Date.now() + 36000000);
    this.resetPasswordToken = randomBytes(20).toString("hex");
  }

  /**
   * Returns only basic user info
   * @returns {TPartialUser} Returns basic user info
   */
  getUserInfo(): TPartialUser {
    return pick(this, ["id", "username", "email", "verified"]);
  }
}
