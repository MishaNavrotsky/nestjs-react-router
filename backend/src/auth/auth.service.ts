import { Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SafeUser, User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import SignUpUserDto from './dtos/signup-user.dto';
import { EmailAlreadyExistsError } from './auth.errors';
import { instanceToPlain } from 'class-transformer';
import { JwtService } from '@nestjs/jwt';
import SignInUserDto from './dtos/signin-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.type';
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface';
import * as argon2 from 'argon2';

const DUMMY_HASH = '$argon2id$v=19$m=65536,t=3,p=4$ZmFrZXNhbHQAAAAAAAAAAA$E8Yk8U9K3VXbq4uEn+nS6Z6Go0Aw4vci2F4uCq7XeLE';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(email: string, pass: string): Promise<SafeUser | null> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      // timing attack
      await argon2.verify(DUMMY_HASH, pass);
      return null;
    }

    const hashedPasswordCorrect = await argon2.verify(user.password, pass);
    if (!hashedPasswordCorrect) {
      return null
    }

    return instanceToPlain(user) as SafeUser;
  }

  async validateUserJwt(payload: JwtPayload): Promise<SafeUser | null> {
    const user = await this.userRepository.findOneBy({ id: payload.id, email: payload.email });
    if (!user) return null;

    return instanceToPlain(user) as SafeUser;
  }

  // It is being called after validateUser
  async signInUser(user: AuthenticatedRequest['user']) {
    const payload: JwtPayload = { email: user.email, id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    }
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
    })
  }
}
