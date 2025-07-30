// create-user.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export default class SignUpUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;


  @IsOptional()
  @MaxLength(100)
  firstName: string | undefined;

  @IsOptional()
  @MaxLength(100)
  lastName: string | undefined;
}