import { ApiProperty } from '@nestjs/swagger';

export class PublicUserDto {
  @ApiProperty({ example: 'clx0123456789abcdef' })
  id!: string;

  @ApiProperty({ example: 'coralie@example.com' })
  email!: string;

  @ApiProperty({ example: 'Coralie' })
  firstName!: string;

  @ApiProperty({ example: 'Fortunato' })
  lastName!: string;
}
