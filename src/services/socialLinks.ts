import { SocialLinks } from "../entities/SocialLink";
import { getRepository, Repository } from "typeorm";

/**
 * Payload for creating SocialLinks
 */
export type TSocialLinksCreatePayload = {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
};

/**
 * Payload for updating SocialLinks
 */
export type TSocialLinksUpdatePayload = TSocialLinksCreatePayload & {
  id: number;
};

/**
 * SocialLinks services
 */
export class SocialLinksService {
  private socialLinksRepository: Repository<SocialLinks>;
  constructor() {
    this.socialLinksRepository = getRepository(SocialLinks);
  }

  /**
   * Creates new SocialLinks entry in the database
   * @param {TSocialLinksCreatePayload} payload containes user social links
   * @returns {SocialLinks} newly created SocialLinks entry
   */
  public async createSocialLinks(
    payload: TSocialLinksCreatePayload
  ): Promise<SocialLinks> {
    const socialLinks = this.socialLinksRepository.create(payload);
    return await socialLinks.save();
  }

  /**
   * Finds and returns SocialLinks with given id
   * @param id id of SocialLinks we want to find
   * @returns SocialLinks instance or null if there is no SocialLinks with given id
   */
  public async getSocialLinks(id: number): Promise<SocialLinks | null> {
    return (await this.socialLinksRepository.findOne(id)) || null;
  }

  /**
   * Updates socialLinks with info sent in payload
   * @param {TSocialLinksUpdatePayload} payload contains new socialLinks info and sociaLLink id
   * @returns {SocialLinks|null} Updated SocialLinks or null
   */
  public async updateSocialLinks(
    payload: TSocialLinksUpdatePayload
  ): Promise<SocialLinks | null> {
    if (await this.socialLinksRepository.findOne(payload.id))
      return await this.socialLinksRepository.save(payload);
    return null;
  }
}
