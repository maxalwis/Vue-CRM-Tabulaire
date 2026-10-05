import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ListContactsDto } from './dto/list-contacts.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  list(@Query() dto: ListContactsDto) {
    return this.contactsService.list(dto);
  }

  @Post()
  create(@Body('values') values?: Record<string, any>) {
    return this.contactsService.create(values);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body('values') values: Record<string, any>,
  ) {
    return this.contactsService.update(id, values);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.remove(id);
  }
}
