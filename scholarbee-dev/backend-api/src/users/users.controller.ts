import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthReq } from 'src/auth/decorators/auth-req.decorator';
import { AuthenticatedRequest } from 'src/auth/types/auth.interface';
import { ChatService } from 'src/chat/chat.service';
import { CreateEducationalBackgroundDto } from 'src/users/dto/create-educational-bg.dto';
import { CreateNationalIdCardDto } from 'src/users/dto/create-nic.dto';
import { UpdateEducationalBackgroundDto } from 'src/users/dto/update-educational-bg.dto';
import { UpdateNationalIdCardDto } from 'src/users/dto/update-nic.dto';
import { ResourceProtectionGuard } from '../auth/guards/resource-protection.guard';
import { AddEducationalBackgroundUsersApiDoc } from './api-docs/add-educational-background-users.api-doc';
import { AddNationalIdCardUsersApiDoc } from './api-docs/add-national-id-card-users.api-doc';
import { DeleteUserUsersApiDoc } from './api-docs/delete-user-users.api-doc';
import { FindAllUsersApiDoc } from './api-docs/find-all-users.api-doc';
import { GetProfileUsersApiDoc } from './api-docs/get-profile-users.api-doc';
import { GetRegistrationLegalRequirementsUsersApiDoc } from './api-docs/get-registration-legal-requirements-users.api-doc';
import { GetStudentSignupsStatisticsApiDoc } from './api-docs/get-student-signups-statistics.api-doc';
import { GetStudentSignupsApiDoc } from './api-docs/get-student-signups.api-doc';
import { GetUserByIdUsersApiDoc } from './api-docs/get-user-by-id-users.api-doc';
import { RemoveEducationalBackgroundUsersApiDoc } from './api-docs/remove-educational-background-users.api-doc';
import { UpdateEducationalBackgroundUsersApiDoc } from './api-docs/update-educational-background-users.api-doc';
import { UpdateNationalIdCardUsersApiDoc } from './api-docs/update-national-id-card-users.api-doc';
import { UpdateMeUsersApiDoc } from './api-docs/update-me-users.api-doc';
import { UpdateUserUsersApiDoc } from './api-docs/update-user-users.api-doc';
import { GetStudentSignupsDto } from './dto/get-student-signups.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserNS } from './schemas/user.schema';
import { UsersService } from './users.service';

@ApiTags('users -> ✅ (Verified)')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly chatService: ChatService,
  ) { }

  // @Deprecated: Use the signup endpoint instead
  // @UseGuards(ResourceProtectionGuard)
  // @Post()
  // async create(@Body() createUserDto: CreateUserDto) {
  //   const result = await this.usersService.create(createUserDto);

  //   return result;
  // }

  @UseGuards(ResourceProtectionGuard)
  @Get()
  @FindAllUsersApiDoc()
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @UseGuards(ResourceProtectionGuard)
  @Get('/registration-legal-document-requirements')
  @GetRegistrationLegalRequirementsUsersApiDoc()
  async getUserRegistrationLegalRequirements() {
    return this.usersService.getUserRegistrationLegalDocuments();
  }

  @UseGuards(ResourceProtectionGuard)
  @Get('student-signups/statistics')
  @GetStudentSignupsStatisticsApiDoc()
  getStudentSignupStatistics(
    @AuthReq(UserNS.UserType.Super_Admin) authReq: AuthenticatedRequest,
  ) {
    return this.usersService.getStudentSignupStatistics();
  }

  @UseGuards(ResourceProtectionGuard)
  @Get('student-signups')
  @GetStudentSignupsApiDoc()
  getStudentSignups(
    @Query() query: GetStudentSignupsDto,
    @Headers('timezone') timezone: string,
    @AuthReq(UserNS.UserType.Super_Admin) authReq: AuthenticatedRequest,
  ) {
    return this.usersService.getStudentSignupsByDateRange(query, timezone);
  }

  @UseGuards(ResourceProtectionGuard)
  @Get(':id')
  @GetUserByIdUsersApiDoc()
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(ResourceProtectionGuard)
  @Patch('me')
  @UpdateMeUsersApiDoc()
  updateMe(
    @AuthReq() authReq: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(authReq.user.sub, updateUserDto);
  }

  @UseGuards(ResourceProtectionGuard)
  @Patch(':id')
  @UpdateUserUsersApiDoc()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(ResourceProtectionGuard)
  @Delete(':id')
  @DeleteUserUsersApiDoc()
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @UseGuards(ResourceProtectionGuard)
  @Post(':userId/educational-backgrounds')
  @AddEducationalBackgroundUsersApiDoc()
  addEducationalBackground(
    @Param('userId') userId: string,
    @Body() payload: CreateEducationalBackgroundDto,
  ) {
    return this.usersService.addEducationalBackground(userId, payload);
  }

  @UseGuards(ResourceProtectionGuard)
  @Post(':id/national-id-card')
  @AddNationalIdCardUsersApiDoc()
  addNationalIdCard(
    @Param('id') id: string,
    @Body() payload: CreateNationalIdCardDto,
  ) {
    return this.usersService.addNationalIdCard(id, payload);
  }

  @UseGuards(ResourceProtectionGuard)
  @Patch(':id/educational-backgrounds/:backgroundId')
  @UpdateEducationalBackgroundUsersApiDoc()
  updateEducationalBackground(
    @Param('id') id: string,
    @Param('backgroundId') backgroundId: string,
    @Body() payload: UpdateEducationalBackgroundDto,
  ) {
    return this.usersService.updateEducationalBackground(
      id,
      backgroundId,
      payload,
    );
  }

  @UseGuards(ResourceProtectionGuard)
  @Delete(':id/educational-backgrounds/:backgroundId')
  @RemoveEducationalBackgroundUsersApiDoc()
  removeEducationalBackground(
    @Param('id') id: string,
    @Param('backgroundId') backgroundId: string,
  ) {
    return this.usersService.removeEducationalBackground(id, backgroundId);
  }

  @UseGuards(ResourceProtectionGuard)
  @Patch(':id/national-id-card')
  @UpdateNationalIdCardUsersApiDoc()
  updateNationalIdCard(
    @Param('id') id: string,
    @Body() payload: UpdateNationalIdCardDto,
  ) {
    return this.usersService.updateNationalIdCard(id, payload);
  }

  @UseGuards(ResourceProtectionGuard)
  @Get('profile/me')
  @GetProfileUsersApiDoc()
  getProfile(@AuthReq() req: AuthenticatedRequest) {
    return this.usersService.findOne(req.user.sub);
  }
}
