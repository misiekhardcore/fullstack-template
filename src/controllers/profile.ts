import {
  SocialLinksService,
  TSocialLinksCreatePayload,
} from "../services/socialLinks";
import {
  Body,
  Controller,
  Post,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { Profile } from "../entities/Profile";
import {
  ProfileService,
  TProfileCreatePayload,
} from "../services/profile";
import { User } from "../entities";

export type TCreateProfilePayload = {
  profile: Omit<TProfileCreatePayload, "user" | "socials">;
  socialLinks: TSocialLinksCreatePayload;
};

/**
 * Profile controller
 */
@Route("profiles")
@Tags("User")
export class ProfileController extends Controller {
  private profileService;
  private socialLinksService;
  constructor() {
    super();
    this.profileService = new ProfileService();
    this.socialLinksService = new SocialLinksService();
  }

  /**
   * Let user to create his profile
   * @param {TCreateProfilePayload} payload
   * @param req contains user info from auth middleware
   * @returns {Promise<Profile>} created user profile
   */
  @Post("/")
  @Security("jwt")
  public async createProfile(
    @Body() payload: TCreateProfilePayload,
    @Request() req: Express.Request
  ): Promise<Profile> {
    // Geting User
    const user = req.user;
    console.log(user);

    // Create new SocialLinks
    const socialLinks = await this.socialLinksService.createSocialLinks(
      payload.socialLinks
    );

    // Create profile using SocialLinks and User
    const profile = await this.profileService.createProfile({
      ...payload.profile,
      socials: socialLinks,
      user: new User(),
    });

    return profile;
  }
}
