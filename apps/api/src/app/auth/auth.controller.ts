import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  REFRESH_COOKIE,
  clearAuthCookies,
  setAuthCookies,
} from './auth-cookies';
import { CurrentUser } from './current-user.decorator';
import type { AuthUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  AuthSessionResponseDto,
  LogoutResponseDto,
} from './dto/auth-response.dto';
import { PublicUserDto } from './dto/public-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates the account and sets httpOnly access + refresh cookies.',
  })
  @ApiCreatedResponse({ type: AuthSessionResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiConflictResponse({ description: 'Email already registered' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.register(dto);
    this.writeCookies(res, tokens.accessToken, tokens.refreshToken);
    return { user: tokens.user };
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description: 'Validates credentials and sets httpOnly session cookies.',
  })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(dto);
    this.writeCookies(res, tokens.accessToken, tokens.refreshToken);
    return { user: tokens.user };
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh session',
    description:
      'Rotates the refresh cookie (same family). Reuse of an old refresh token revokes the whole family.',
  })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid refresh cookie' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const tokens = await this.authService.refresh(raw);
    this.writeCookies(res, tokens.accessToken, tokens.refreshToken);
    return { user: tokens.user };
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Logout',
    description: 'Revokes the refresh-token family and clears auth cookies.',
  })
  @ApiOkResponse({ type: LogoutResponseDto })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.authService.logout(raw);
    clearAuthCookies(res);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiCookieAuth('fm_access_token')
  @ApiOperation({ summary: 'Current authenticated user' })
  @ApiOkResponse({ type: PublicUserDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.id);
  }

  private writeCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    setAuthCookies(
      res,
      accessToken,
      refreshToken,
      this.authService.accessMaxAgeMs,
      this.authService.refreshMaxAgeMs,
    );
  }
}
