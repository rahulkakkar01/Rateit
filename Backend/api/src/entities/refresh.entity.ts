import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  BeforeInsert,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class refreshTokenEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column({
    default: false,
  })
  active: boolean;

  @Column({ type: 'timestamp' })
  expires: Date;

  @BeforeInsert()
  setExpiryDate() {
    const now = new Date(Date.now());
    now.setMonth(now.getMonth() + 2);
    this.expires = now;
  }

  @ManyToOne(() => UserEntity, (user) => user.refreshTokens)
  user: UserEntity;
}
