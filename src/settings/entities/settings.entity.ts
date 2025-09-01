import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export interface DeliveryCost {
  name: string;
  cost: number;
}

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Social Media Links
  @Column({ nullable: true })
  facebookUrl?: string;

  @Column({ nullable: true })
  instagramUrl?: string;

  @Column({ nullable: true })
  twitterUrl?: string;

  @Column({ nullable: true })
  linkedinUrl?: string;

  @Column({ nullable: true })
  youtubeUrl?: string;

  @Column({ nullable: true })
  whatsappNumber?: string;

  @Column({ nullable: true })
  telegramUrl?: string;

  @Column({ nullable: true })
  tiktokUrl?: string;

  @Column({ nullable: true })
  snapchatUrl?: string;

  // Delivery Costs (JSON array)
  @Column('json', { nullable: true })
  deliveryCosts?: DeliveryCost[];
}
