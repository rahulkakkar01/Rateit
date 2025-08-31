import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ShopOwnerEntity } from './shopowner.entity';
import { RatingEntity } from './rating.entity';

@Entity('shops')
export class ShopEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  openingHours?: string;

  @Column({ nullable: true })
  closingHours?: string;

  @Column({ default: true })
  isOpen: boolean;

  @Column({ nullable: true })
  image?: string;

  @ManyToOne(() => ShopOwnerEntity, (owner) => owner.shops)
  owner: ShopOwnerEntity;

  @OneToMany(() => RatingEntity, (rating) => rating.shop)
  ratings: RatingEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
