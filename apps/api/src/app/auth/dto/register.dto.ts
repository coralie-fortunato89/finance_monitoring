import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Coralie', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Fortunato', minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: 'coralie@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Password1ab',
    minLength: 10,
    maxLength: 128,
    description:
      'At least 10 characters, one uppercase, one lowercase, one digit.',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Le mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule et un chiffre.',
  })
  password!: string;
}
