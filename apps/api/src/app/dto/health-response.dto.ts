import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ enum: ['up', 'down'], example: 'up' })
  database!: 'up' | 'down';
}

export class RootMessageDto {
  @ApiProperty({ example: 'Hello API' })
  message!: string;
}
