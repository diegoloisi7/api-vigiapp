import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IdPipe } from '../../common/id.pipe';
import { Public, Roles } from '../auth/auth.decorators';
import { ContactService } from './contact.service';

@Controller('contactos')
export class ContactController {
  constructor(private readonly contacts: ContactService) {}

  @Public()
  @Post()
  create(@Body() body: Parameters<ContactService['create']>[0]) {
    return this.contacts.create(body);
  }
}

@Roles('ADMIN')
@Controller('admin/contactos')
export class AdminContactController {
  constructor(private readonly contacts: ContactService) {}

  @Get()
  list() { return this.contacts.list(); }

  @Post(':id/leido')
  read(@Param('id', IdPipe) id: string) { return this.contacts.read(id); }
}
