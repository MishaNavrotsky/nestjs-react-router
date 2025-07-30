import { Injectable } from '@nestjs/common';
import { CacheService } from './cache/cache.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './database/entities/user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class AppService {
  constructor(
    private readonly cacheService: CacheService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async getHello(): Promise<string> {
    return 'Hello World!';
  }
}
