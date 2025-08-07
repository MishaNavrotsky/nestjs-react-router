import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SafeUser, User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import SignUpUserDto from './dtos/signup-user.dto';
import { EmailAlreadyExistsError } from './auth.errors';
import { instanceToPlain } from 'class-transformer';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, RefreshPayload } from './interfaces/jwt-payload.type';
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface';
import * as argon2 from 'argon2';
import { CacheService } from 'src/cache/cache.service';
import { ConfigService } from '@nestjs/config';
import * as ms from 'ms';

const DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$ZmFrZXNhbHQAAAAAAAAAAA$E8Yk8U9K3VXbq4uEn+nS6Z6Go0Aw4vci2F4uCq7XeLE';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
    private readonly config: ConfigService,
  ) {}

  private static JtiJwtCacheKey(userId: number) {
    return `jwt:jti:${userId}`;
  }

  private static JtiRefreshCacheKey(userId: number) {
    return `refresh:jti:${userId}`;
  }

  async validateUser(email: string, pass: string): Promise<SafeUser | null> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      // timing attack
      await argon2.verify(DUMMY_HASH, pass);
      return null;
    }

    const hashedPasswordCorrect = await argon2.verify(user.password, pass);
    if (!hashedPasswordCorrect) {
      return null;
    }

    return instanceToPlain(user) as SafeUser;
  }

  async validateUserJwt(payload: JwtPayload): Promise<SafeUser | null> {
    const jti = await this.cacheService.get(
      AuthService.JtiJwtCacheKey(payload.id),
    );
    if (!jti || jti !== payload.jti) return null;

    const user = await this.userRepository.findOneBy({ id: payload.id });
    if (!user) return null;

    return instanceToPlain(user) as SafeUser;
  }

  async signOut(user: AuthenticatedRequest['user']) {
    await this.cacheService.del(AuthService.JtiJwtCacheKey(user.id));
    await this.cacheService.del(AuthService.JtiRefreshCacheKey(user.id));
  }

  // It is being called after validateUser
  async signInUser(user: AuthenticatedRequest['user']) {
    const jwtPayload: JwtPayload = {
      email: user.email,
      id: user.id,
      jti: crypto.randomUUID(),
    };
    const jwtExpiration = ms(
      this.config.get<string>('JWT_TOKEN_EXPIRES_IN')! as ms.StringValue,
    );
    await this.cacheService.set(
      AuthService.JtiJwtCacheKey(user.id),
      jwtPayload.jti,
      jwtExpiration,
    );

    const refreshPayload: RefreshPayload = {
      id: user.id,
      jti: crypto.randomUUID(),
    };
    const refreshExpiration = ms(
      this.config.get<string>('REFRESH_TOKEN_EXPIRES_IN')! as ms.StringValue,
    );
    await this.cacheService.set(
      AuthService.JtiRefreshCacheKey(user.id),
      refreshPayload.jti,
      refreshExpiration,
    );
    return {
      access_token: await this.jwtService.signAsync(jwtPayload),
      refresh_token: await this.jwtService.signAsync(refreshPayload),
    };
  }

  async signUpUser(data: SignUpUserDto) {
    if (await this.userRepository.existsBy({ email: data.email })) {
      throw new EmailAlreadyExistsError();
    }

    return await this.userRepository.insert({
      email: data.email,
      password: await argon2.hash(data.password),
      lastName: data.lastName,
      firstName: data.firstName,
    });
  }

  async refreshJwt(jwtToken: string, refreshToken: string) {
    const payload = await this.jwtService
      .verifyAsync<RefreshPayload>(refreshToken)
      .catch();
    const jti = await this.cacheService.get(
      AuthService.JtiRefreshCacheKey(payload.id),
    );
    if (!jti || jti !== payload.jti) throw new UnauthorizedException();

    const user = await this.userRepository.findOneBy({ id: payload.id });
    if (!user) throw new UnauthorizedException();
    return this.signInUser(user);
  }
}
