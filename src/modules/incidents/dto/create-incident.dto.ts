import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsNumberString,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIncidentDto {
  @ApiProperty({ type: String, pattern: '^[1-9]\\d*$', example: '1' })
  @IsNumberString()
  @Matches(/^[1-9]\d*$/)
  groupId!: string;
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    pattern: '^[1-9]\\d*$',
    example: '1',
    description: 'Obligatoria para reportes STANDARD.',
  })
  @IsOptional()
  @IsNumberString()
  @Matches(/^[1-9]\d*$/)
  categoryId?: string | null;
  @ApiProperty({ enum: ['STANDARD', 'URGENT'] })
  @IsEnum(['STANDARD', 'URGENT'])
  reportType!: 'STANDARD' | 'URGENT';
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    maxLength: 200,
    description: 'Obligatorio para reportes STANDARD.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string | null;
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Obligatoria para reportes STANDARD.',
  })
  @IsOptional()
  @IsString()
  description?: string | null;
  @ApiProperty({
    minimum: -90,
    maximum: 90,
    example: -34.603722,
    description: 'Debe quedar dentro del radio del grupo indicado.',
  })
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-90)
  @Max(90)
  latitude!: number;
  @ApiProperty({
    minimum: -180,
    maximum: 180,
    example: -58.381592,
    description: 'Debe quedar dentro del radio del grupo indicado.',
  })
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-180)
  @Max(180)
  longitude!: number;
  @ApiProperty({ enum: ['GPS', 'HOME', 'MANUAL'] })
  @IsEnum(['GPS', 'HOME', 'MANUAL'])
  locationSource!: 'GPS' | 'HOME' | 'MANUAL';
  @ApiPropertyOptional({ type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2030-12-31T23:59:59.000Z',
    description: 'Fecha futura con zona horaria explícita.',
  })
  @IsISO8601({ strict: true })
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  expiresAt!: string;
}
