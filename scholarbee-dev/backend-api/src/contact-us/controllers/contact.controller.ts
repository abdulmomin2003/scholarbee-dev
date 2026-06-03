import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ContactService } from '../services/contact.service';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';
import { QueryContactDto } from '../dto/query-contact.dto';
import { ResourceProtectionGuard } from '../../auth/guards/resource-protection.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ApiTags } from '@nestjs/swagger';
import { CreateContactApiDoc } from '../api-docs/create-contact.api-doc';
import { FindAllContactsApiDoc } from '../api-docs/find-all-contacts.api-doc';
import { GetContactsStatisticsApiDoc } from '../api-docs/get-statistics-contacts.api-doc';
import { FindOneContactApiDoc } from '../api-docs/find-one-contact.api-doc';
import { UpdateContactApiDoc } from '../api-docs/update-contact.api-doc';
import { RemoveContactApiDoc } from '../api-docs/remove-contact.api-doc';

@ApiTags('contact-us')
@Controller('contact-us')
export class ContactController {
  constructor(private readonly contactService: ContactService) { }

  @Post()
  @CreateContactApiDoc()
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  @FindAllContactsApiDoc()
  findAll(@Query() queryDto: QueryContactDto) {
    return this.contactService.findAll(queryDto);
  }

  @UseGuards(ResourceProtectionGuard)
  @Get('statistics')
  @GetContactsStatisticsApiDoc()
  getStatistics() {
    return this.contactService.getStatistics();
  }

  @UseGuards(ResourceProtectionGuard)
  @Get(':id')
  @FindOneContactApiDoc()
  findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @UpdateContactApiDoc()
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactService.update(id, updateContactDto);
  }

  @UseGuards(ResourceProtectionGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @RemoveContactApiDoc()
  remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }
} 