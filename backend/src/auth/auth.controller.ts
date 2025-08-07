import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import SignInUserDto from './dtos/signin-user.dto';
import SignUpUserDto from './dtos/signup-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { isProd } from '../config/env.config';

@Controller('auth')
export class AuthController {
  private static readonly JWT_TOKEN_COOKIE_NAME = 'access_token';
  private static readonly REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

  constructor(private authService: AuthService) {}

  setJwtCookies(res: Response, jwtToken: string, refreshToken: string) {
    res.cookie(AuthController.JWT_TOKEN_COOKIE_NAME, jwtToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    });

    res.cookie(AuthController.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    });
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signIn(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() _signInDto: SignInUserDto,
  ) {
    const result = await this.authService.signInUser(req.user);
    this.setJwtCookies(res, result.access_token, result.refresh_token);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('signout')
  async signOut(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.signOut(req.user);
    res.clearCookie(AuthController.JWT_TOKEN_COOKIE_NAME);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpUserDto) {
    return await this.authService.signUpUser(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const jwtToken = req.cookies?.[
      AuthController.JWT_TOKEN_COOKIE_NAME
    ] as string;
    const refreshToken = req.cookies?.[
      AuthController.REFRESH_TOKEN_COOKIE_NAME
    ] as string;

    if (!jwtToken || !refreshToken) throw new UnauthorizedException();

    const result = await this.authService.refreshJwt(jwtToken, refreshToken);
    this.setJwtCookies(res, result.access_token, result.refresh_token);
    return result;
  }
}
