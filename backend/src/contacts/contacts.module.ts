import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnEntity } from '../columns/column.entity';
import { ContactsController } from './contacts.controller';
import { Contact } from './contact.entity';
import { ContactsService } from './contacts.service';

@Module({
  imports: [TypeOrmModule.forFeature([ColumnEntity, Contact])],
  controllers: [ContactsController],
  providers: [ContactsService],
})
export class ContactsModule {}
