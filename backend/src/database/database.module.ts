import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Item } from './entities/item.entity';
import { config, isDev } from '../config/env.config';

const dbConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  entities: [User, Item],
  synchronize: isDev,
};

@Module({
  imports: [TypeOrmModule.forRoot(dbConfig)],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
