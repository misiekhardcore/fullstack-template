import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class SocialLinks extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", nullable: true })
  facebook: string | null;

  @Column({ type: "text", nullable: true })
  twitter: string | null;

  @Column({ type: "text", nullable: true })
  linkedin: string | null;

  @Column({ type: "text", nullable: true })
  github: string | null;
}
