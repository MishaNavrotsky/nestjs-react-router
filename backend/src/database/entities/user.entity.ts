import { Entity, Column, OneToMany } from 'typeorm';
import BaseModel from './base.entity';
import { Item } from './item.entity';
import { Exclude } from 'class-transformer';
import { OmitFunctions } from 'src/helpers';

@Entity('users')
export class User extends BaseModel {
  @Column({ length: 100, nullable: true })
  firstName: string;

  @Column({ length: 100, nullable: true })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Exclude()
  @OneToMany(() => Item, (item) => item.user)
  items: Item[];
}

export type SafeUser = Omit<OmitFunctions<User>, 'password' | 'items'>;