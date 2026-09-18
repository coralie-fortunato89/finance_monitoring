import { ApiProperty } from '@nestjs/swagger';
import { PublicUserDto } from './public-user.dto';

export class AuthSessionResponseDto {
  @ApiProperty({ type: PublicUserDto })
  user!: PublicUserDto;
}

export class LogoutResponseDto {
  @ApiProperty({ example: true })
  ok!: boolean;
}
