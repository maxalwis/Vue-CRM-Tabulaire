import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class ListContactsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit: number = 50;

  // "id" = tri sur la colonne native "#", sinon UUID d'une colonne dynamique
  @IsOptional()
  @ValidateIf((o) => o.sortBy !== 'id')
  @IsUUID()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsString()
  filters?: string;
}
