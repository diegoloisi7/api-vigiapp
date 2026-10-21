import {
  IsBooleanString,
  IsNumberString,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListIncidentsDto {
  @ApiPropertyOptional({ type: String, pattern: '^[1-9]\\d*$', example: '1' })
  @IsOptional()
  @IsNumberString()
  @Matches(/^[1-9]\d*$/)
  groupId?: string;
  @ApiPropertyOptional({
    enum: ['true', 'false'],
    description: 'true: solo incidentes activos y no vencidos',
  })
  @IsOptional()
  @IsBooleanString()
  active?: string;
}
