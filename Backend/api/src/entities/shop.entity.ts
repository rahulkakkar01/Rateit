import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ShopOwnerEntity } from './shopowner.entity';

@Entity('shops')
export class ShopEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  address?: string;

  @ManyToOne(() => ShopOwnerEntity, (owner) => owner.id)
  owner: ShopOwnerEntity;
}
