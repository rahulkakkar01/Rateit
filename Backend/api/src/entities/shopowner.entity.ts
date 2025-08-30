import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}

