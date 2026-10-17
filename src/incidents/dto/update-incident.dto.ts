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

export class UpdateIncidentDto {
  @IsOptional() @IsNumberString() @Matches(/^[1-9]\d*$/) categoryId?:
    string | null;
  @IsOptional() @IsString() @MaxLength(200) title?: string | null;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-90)
  @Max(90)
  latitude?: number;
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-180)
  @Max(180)
  longitude?: number;
  @IsOptional() @IsEnum(['GPS', 'HOME', 'MANUAL']) locationSource?:
    'GPS' | 'HOME' | 'MANUAL';
  @IsOptional() @IsBoolean() isAnonymous?: boolean;
  @IsOptional() @IsEnum(['ACTIVE', 'RESOLVED', 'DISMISSED']) status?:
    'ACTIVE' | 'RESOLVED' | 'DISMISSED';
  @IsOptional()
  @IsISO8601({ strict: true })
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  expiresAt?: string;
}
