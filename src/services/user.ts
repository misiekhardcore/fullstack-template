import { TPartialUser } from "src/entities/User";
import { ValidateError } from "tsoa";
import { getRepository, MoreThan, Repository } from "typeorm";
import { User } from "../entities";
import sendMail from "../utils/sendMail";

/**
 * Response containing only the string message
 */
export interface IMessageResponse {
  message: string;
}

/**
 * Payload data sent by user to create new account
 */
export type TRegisterPayload = {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

/**
 * Payload data sent by user to sign in
 */
export type TLoginPayload = {
  email: string;
  password: string;
};

/**
 * Type of response from login service
 */
export type TLoginResponse = { token: string; user: TPartialUser };

/**
 * Type of payload needed for password reset
 */
export type TPasswordResetPayload = {
  password: string;
  confirmPassword: string;
  resetPasswordToken: string;
};

/**
 * User services class containins all functions to get, add or modify user data
 */
export class UserService {
  private userRepository: Repository<User>;
  constructor() {
    this.userRepository = getRepository(User);
  }

  /**
   * Returns all users from database
   * @returns {Promise<User[]>}
   */
  public async getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * Returns user with a given id
   * @param {string} id id of user who we want to find
   * @returns {Promise<User|null>} returns user or null if there is no user with given id
   */
  public async getUser(id: number): Promise<User | null> {
    // Try to find user with given id
    const user = await this.userRepository.findOne({ id });

    return user || null;
  }

  /**
   * Allows user to create new account
   * @param {TRegisterPayload} payload data sent by user to create new account
   * @returns {Promise<TPartialUser>} returns basic user info
   */
  public async register(
    payload: TRegisterPayload
  ): Promise<TPartialUser> {
    try {
      // Check if passwords match and throw error if not
      if (payload.password != payload.confirmPassword)
        throw new Error("Passwords not match");

      // Create new user with given data
      const user = await this.userRepository.save(User.create(payload));

      // Prepare html for verification email
      const html = `
    <h1>Welcome, ${user.username}</h1>
    <p>Verify your account by clicking this link:</p>
    <a href='http://localhost:4000/users/verify-account/${user.verificationCode}'>Link</a>
    `;

      // Send verification email and check if its sent successfully
      const isSent = await sendMail(
        user.email,
        "Verify your account",
        "Please verify your account.",
        html
      );

      // If email sent successfully return basic user info
      if (isSent) return user.getUserInfo();
      // If email failed to send delete created user and throw error
      else this.userRepository.delete({ id: user.id });
      throw new Error("Unable to sent verification email");
    } catch (error) {
      // Create Verification error and set 400 status
      const err = new ValidateError({}, "");
      err.status = 400;

      // If database throw unique email constraints, set proper error message
      if (error.code === "23505") {
        if (error.detail.includes("(email)"))
          err.message = "Email already taken";
        throw err;
      }

      //Use thrown message and throw error further
      err.message = error.message;
      throw err;
    }
  }

  /**
   * Allows user to sign in
   * @param {TLoginPayload} payload contains user credentials to sign in
   * @returns {TLoginResponse} returns basic user info and jwt token
   */
  public async login(payload: TLoginPayload): Promise<TLoginResponse> {
    const { email, password } = payload;
    // Prepare validation error to use if something goes wrong
    const error = new ValidateError({}, "Invalid email or password");
    error.status = 400;

    // Try to find user with given email
    const user = await this.userRepository
      .createQueryBuilder("user")
      .where("user.email=:email", { email })
      .addSelect("user.password")
      .getOne();

    // If user not found throw ValidateError
    if (!user) throw error;

    // Verify user password
    const verify = await user.comparePassword(password);
    // If password is wrong throw ValidateError
    if (!verify) throw error;

    // Create JWT token
    const token = user.generateJWT();

    return { user: user.getUserInfo(), token };
  }

  /**
   * Verify registered user based on code from verification email
   * @param {string} verificationCode code from verification email after registration
   * @returns {TPartialUser} returns basic user info
   */
  public async verificateCode(
    verificationCode: string
  ): Promise<TPartialUser> {
    // Try to find user with this verificationCode
    const user = await this.userRepository.findOne({
      verificationCode,
    });

    // If user is not found throw ValidateError
    if (!user) {
      const error = new ValidateError({}, "Invalid verification code");
      error.status = 400;
      throw error;
    }

    // If user was found, update user info
    await this.userRepository.update(
      { id: user.id },
      { verificationCode: null, verified: true }
    );

    return user.getUserInfo();
  }

  /**
   * Allows user to reset forgotten password
   * @param {string} email email of account to reset password
   * @returns {IMessageResponse} returns message to check email for reset password link
   */
  public async resetPassword(email: string): Promise<IMessageResponse> {
    try {
      //  Check if user with given email exists
      const user = await this.userRepository.findOne({ email });

      // If user not exist send message to check email (protects from email guessing)
      if (!user) {
        return { message: "Check your email for reset password link" };
      }

      // Prepare reset password token and expiration date of this token
      user.generatePasswordReset();
      await this.userRepository.save(user);

      // Prepare html for reset password email
      const html = `
    <h1>Welcome, ${user.username}</h1>
    <p>To reset your password use this link:</p>
    <a href='http://localhost:4000/users/reset-password/${user.resetPasswordToken}'>Link</a>
    `;

      // Try to send email
      await sendMail(
        user.email,
        "Reset password request",
        "Click the link to reset password",
        html
      );
      // If successfully send show message to check email
      return { message: "Check your email for reset password link" };
    } catch (error) {
      // If error ocurred still send the same message to protect users
      return { message: "Check your email for reset password link" };
    }
  }

  /**
   * Checks if reset password token is valid
   * @param {string} resetPasswordToken token from reset password email
   * @returns {Promise<boolean>} return basic user info
   */
  public async resetPasswordCheck(
    resetPasswordToken: string
  ): Promise<boolean> {
    // Check if user with this token exists
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordExp: MoreThan(new Date(Date.now())),
        resetPasswordToken,
      },
    });

    // If user not exists throw ValidateError
    if (!user) {
      const error = new ValidateError(
        {},
        "Invalid reset password token"
      );
      error.status = 400;
      throw error;
    }

    return true;
  }

  /**
   * Saves new password after reset
   * @param {TPasswordResetPayload} payload data from user with reset token
   * @returns {Promise<IMessageResponse>} return message that everything went good
   */
  public async resetPasswordSave(
    payload: TPasswordResetPayload
  ): Promise<IMessageResponse> {
    try {
      const { password, confirmPassword, resetPasswordToken } = payload;

      // Check if passwords match and if not throw an error
      if (password !== confirmPassword)
        throw new Error("Passwords not match");

      // Try to find user with reset token
      const user = await this.userRepository.findOne({
        resetPasswordToken,
      });

      // If user not found throw error
      if (!user) throw new Error("Invalid reset request");

      // set new user password
      user.password = password;
      await user.hashPassword();
      await this.userRepository.save(user);

      return { message: "Password reset successful" };
    } catch (error) {
      // Throw ValidateError error
      const err = new ValidateError({}, "");
      err.status = 400;
      err.message = error.message;
      throw err;
    }
  }
}
