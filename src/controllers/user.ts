import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Put,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";
import { User } from "../entities";
import { TPartialUser } from "../entities/User";
import {
  IMessageResponse,
  TLoginPayload,
  TPasswordResetPayload,
  TRegisterPayload,
  UserService,
} from "../services/user";

/**
 * Authorization header with JWT token
 */
type TAuthHeader = { Authorization: string };

/**
 * Handles all user related activities
 */
@Route("users")
@Tags("User")
export class UserController extends Controller {
  private userService;
  constructor() {
    super();
    this.userService = new UserService();
  }

  /**
   * Gives back list of all users
   * @returns {Promise<User[]>} returns list of all users
   */
  @SuccessResponse(200, "Get all users successfully")
  @Get("/")
  public async getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  /**
   * Returns user with a given id
   * @param {number} id id of the user we want to get from database
   * @returns {Promise<User | null>} return user if found or null if not
   */
  @SuccessResponse(200, "Get user with given id successfully")
  @Get("/:id")
  public async getUser(@Path() id: number): Promise<User | null> {
    return this.userService.getUser(id);
  }

  /**
   * Allows user to sing in
   * @param {TLoginPayload} body containes email and password
   * @returns {Promise<TPartialUser>} returns basic user info
   */
  @Post("/login")
  @SuccessResponse<{ Authorization: string }>(
    "Logged in successfully, received user info and jwt token in header"
  )
  public async login(
    @Body() body: TLoginPayload
  ): Promise<TPartialUser> {
    const response = await this.userService.login(body);
    this.setHeader("Authorization", response.token);
    return response.user;
  }

  /**
   * Allow user to create an account, sends verificationn email
   * @param {TRegisterPayload} body contains new user informations
   * @returns {Promise<TPartialUser>} returns basic user info
   */
  @SuccessResponse("201", "User account created")
  @Post("/register")
  public async register(
    @Body() body: TRegisterPayload
  ): Promise<TPartialUser> {
    return this.userService.register(body);
  }

  /**
   * Allow user to verify account, access to this api is gained through the verification email
   * @param {string} verificationCode Code from verification email message
   * @returns {Promise<TPartialUser>} returns basic user info
   */
  @Get("/verify-account/:verificationCode")
  @SuccessResponse("200", "User account verified succesfully")
  public async verificateCode(
    @Path() verificationCode: string
  ): Promise<TPartialUser> {
    return this.userService.verificateCode(verificationCode);
  }

  /**
   * Allows user to create reset password request, generates resetPasswordToken and stores it in user instance in database, sends user reset password link
   * @param {{email:string}} body contsaint email of an account wanting to reset password
   * @returns {Promise<IMessageResponse>} message if password verification email was sent
   */
  @SuccessResponse(
    200,
    "Reset password request successful, email with reset password link sent to the given email"
  )
  @Post("/reset-password/")
  public async resetPassword(
    @Body() body: { email: string }
  ): Promise<IMessageResponse> {
    const { email } = body;
    return this.userService.resetPassword(email);
  }

  /**
   * Accessed from reset password email, checks the resetPasswordToken, clears it in user instance in database and returns basic user info to use for password reset
   * @param {string} resetPasswordToken token generated with reset password request, sent to user via email
   * @returns {Promise<boolean>} returns true if reset password token is valid and not expired
   */
  @Get("/reset-password/:resetPasswordToken")
  public async resetPasswordCheck(
    @Path() resetPasswordToken: string
  ): Promise<boolean> {
    return this.userService.resetPasswordCheck(resetPasswordToken);
  }

  /**
   * Updates the new password asked for in reset
   * @param {TPasswordResetPayload} body contains new password and resetPasswordToken
   * @returns {Promise<IMessageResponse>} returns message with info if request was successful or not
   */
  @Put("reset-password")
  public async resetPasswordSave(
    @Body() body: TPasswordResetPayload
  ): Promise<IMessageResponse> {
    return this.userService.resetPasswordSave(body);
  }
}
