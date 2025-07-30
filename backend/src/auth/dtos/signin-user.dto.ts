// create-user.dto.ts
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export default class SignInUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}