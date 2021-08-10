import {
  Controller,
  FormField,
  Post,
  Request,
  Route,
  Security,
  Tags,
  UploadedFile,
} from "tsoa";
import { User } from "../entities";
import { Profile } from "../entities/Profile";
import {
  ProfileService,
  TProfileCreatePayload,
} from "../services/profile";
import {
  SocialLinksService,
  TSocialLinksCreatePayload,
} from "../services/socialLinks";

export type TCreateProfilePayload = Omit<
  TProfileCreatePayload,
  "user" | "socials"
> &
  TSocialLinksCreatePayload;

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
    @FormField() facebook: string,
    @FormField() twitter: string,
    @FormField() github: string,
    @FormField() linkedin: string,
    @UploadedFile("avatar") avatar: Express.Multer.File,
    @Request() req: any
  ): Promise<Profile> {
    // Geting User
    const user = req.user;

    // Create new SocialLinks
    const socialLinks = await this.socialLinksService.createSocialLinks(
      { facebook, github, twitter, linkedin }
    );

    // Create profile using SocialLinks and User
    const profile = await this.profileService.createProfile({
      avatar: avatar.originalname,
      socials: socialLinks,
      user: new User(),
    });

    return profile;
  }
}
