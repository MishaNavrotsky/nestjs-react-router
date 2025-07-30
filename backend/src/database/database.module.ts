import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { isDev } from 'src/consts';
import { User } from './entities/user.entity';
import { Item } from './entities/item.entity';

const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Item],
  synchronize: isDev,
}


@Module({
  imports: [
    TypeOrmModule.forRoot(config),
  ],
  exports: [TypeOrmModule]
})
export class DatabaseModule { }
