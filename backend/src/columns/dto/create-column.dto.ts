import { IsEnum, IsString, IsNotEmpty } from 'class-validator';

export enum ColumnType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  PHONE = 'phone',
}

export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(ColumnType)
  type!: ColumnType;
}
