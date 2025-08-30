import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { ShopEntity } from './shop.entity';

@Entity('ratings')
export class RatingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: number; // rating value (e.g., 1-5)

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => ShopEntity)
  shop: ShopEntity;

  @Column({ nullable: true })
  comment?: string;
}
