import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard)
  @Get('test')
  async authTest(): Promise<string> {
    return "test"
  }
}
