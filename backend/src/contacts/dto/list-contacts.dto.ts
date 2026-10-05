import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class ListContactsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit: number = 50;

  @IsOptional()
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
