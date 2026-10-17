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

export class CreateIncidentDto {
  @IsNumberString() @Matches(/^[1-9]\d*$/) groupId!: string;
  @IsNumberString() @Matches(/^[1-9]\d*$/) createdByUserId!: string;
  @IsOptional() @IsNumberString() @Matches(/^[1-9]\d*$/) categoryId?:
    string | null;
  @IsEnum(['STANDARD', 'URGENT']) reportType!: 'STANDARD' | 'URGENT';
  @IsOptional() @IsString() @MaxLength(200) title?: string | null;
  @IsOptional() @IsString() description?: string | null;
  @IsNumber({ maxDecimalPlaces: 7 }) @Min(-90) @Max(90) latitude!: number;
  @IsNumber({ maxDecimalPlaces: 7 }) @Min(-180) @Max(180) longitude!: number;
  @IsEnum(['GPS', 'HOME', 'MANUAL']) locationSource!: 'GPS' | 'HOME' | 'MANUAL';
  @IsOptional() @IsBoolean() isAnonymous?: boolean;
  @IsISO8601({ strict: true })
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  expiresAt!: string;
}
