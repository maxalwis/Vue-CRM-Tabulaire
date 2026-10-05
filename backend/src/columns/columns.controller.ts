import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ColumnsService } from './columns.service';
import type { ColumnType } from './column.entity';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columns: ColumnsService) {}

  @Get()
  findAll() {
    return this.columns.findAll();
  }

  @Post()
  create(
    @Body('name') name: string,
    @Body('type') type: ColumnType,
  ) {
    return this.columns.create(name, type);
  }

  @Patch('reorder')
  reorder(@Body('columnIds') columnIds: (number | string)[]) {
    return this.columns.reorder(columnIds);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body('name') name: string,
  ) {
    return this.columns.update(id, name);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.columns.remove(id);
  }
}
