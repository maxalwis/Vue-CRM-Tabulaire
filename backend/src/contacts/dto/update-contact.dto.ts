import { IsObject } from 'class-validator';

export class UpdateContactDto {
  @IsObject()
  values!: Record<string, any>; // Permet les mises à jour partielles des cellules
}
