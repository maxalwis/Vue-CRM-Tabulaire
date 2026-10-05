import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnEntity } from './column.entity';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';

@Module({
  imports: [TypeOrmModule.forFeature([ColumnEntity])],
  controllers: [ColumnsController],
  providers: [ColumnsService],
  exports: [ColumnsService],
})
export class ColumnsModule {}
