import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateIncidentDto {
  @ApiPropertyOptional({ type: String, nullable: true, pattern: '^[1-9]\\d*$' })
  @IsOptional()
  @IsNumberString()
  @Matches(/^[1-9]\d*$/)
  categoryId?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true, maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  locationLabel?: string | null;
  @ApiPropertyOptional({
    type: Number,
    minimum: -90,
    maximum: 90,
    description: 'Debe quedar dentro del radio del grupo.',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-90)
  @Max(90)
  latitude?: number;
  @ApiPropertyOptional({
    type: Number,
    minimum: -180,
    maximum: 180,
    description: 'Debe quedar dentro del radio del grupo.',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-180)
  @Max(180)
  longitude?: number;
  @ApiPropertyOptional({ enum: ['GPS', 'HOME', 'MANUAL'] })
  @IsOptional()
  @IsEnum(['GPS', 'HOME', 'MANUAL'])
  locationSource?: 'GPS' | 'HOME' | 'MANUAL';
  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
  @ApiPropertyOptional({ enum: ['ACTIVE', 'RESOLVED', 'DISMISSED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'RESOLVED', 'DISMISSED'])
  status?: 'ACTIVE' | 'RESOLVED' | 'DISMISSED';
  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsISO8601({ strict: true })
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  expiresAt?: string;
}
