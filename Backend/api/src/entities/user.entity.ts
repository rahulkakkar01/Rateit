import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { refreshTokenEntity } from './refresh.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ default: 'user' })
  role: string;
  @OneToMany(() => refreshTokenEntity, (refreshToken) => refreshToken.user)
  refreshTokens: refreshTokenEntity[];
}
