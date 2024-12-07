import { Body, Controller, Get, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/Shared/Infrastructure/jwt/constants';

@Controller('discover/auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService
  ) {}

  @Get('verifyToken')
  async verifyToken(
    @Query('token') token: string
  ) {

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
        secret: jwtConstants.secret
        }
      );
      } catch {
        throw new UnauthorizedException();
      }

      return {
        data: token,
        message: ""
      }
  }
  
}
