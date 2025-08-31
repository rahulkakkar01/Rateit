import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ShopEntity } from './shop.entity';

@Entity('shopowner')
export class ShopOwnerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ default: 'shopowner' })
  role: string;

  @OneToMany(() => ShopEntity, (shop) => shop.owner)
  shops: ShopEntity[];
}

