import { IsObject, IsOptional } from 'class-validator';

export class CreateContactDto {
  @IsObject()
  @IsOptional()
  values?: Record<string, any>; // Clés = column.id ou column.key, valeurs selon le type
}
