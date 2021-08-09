import { Profile } from "../entities/Profile";
import { getRepository, Repository } from "typeorm";
import { SocialLinks } from "src/entities/SocialLink";
import { User } from "src/entities";

/**
 * Payload for creating new profile
 */
export type TProfileCreatePayload = {
  avatar?: string;
  user: User;
  socials: SocialLinks;
};

/**
 * Payload for updating existing profile
 */
export type TProfileUpdatePayload = TProfileCreatePayload & {
  id: number;
};

export class ProfileService {
  private profileRepository: Repository<Profile>;
  constructor() {
    this.profileRepository = getRepository(Profile);
  }

  public async createProfile(
    payload: TProfileCreatePayload
  ): Promise<Profile> {
    const profile = this.profileRepository.create(payload);
    return await profile.save();
  }

  public async getProfile(id: number): Promise<Profile | null> {
    return (await this.profileRepository.findOne(id)) || null;
  }

  public async updateProfile(
    payload: TProfileUpdatePayload
  ): Promise<Profile | null> {
    if (await this.profileRepository.findOne(payload.id))
      return await this.profileRepository.save(payload);
    return null;
  }
}
