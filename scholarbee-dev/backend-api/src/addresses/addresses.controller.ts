import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import { Model, Types } from 'mongoose';
import { AuthReq } from 'src/auth/decorators/auth-req.decorator';
import { AuthenticatedRequest } from 'src/auth/types/auth.interface';
import { CampusesService } from 'src/campuses/campuses.service';
import { Campus, CampusDocument } from 'src/campuses/schemas/campus.schema';
import { ParseObjectIdPipe } from 'src/common/pipes/object-id.pipe';
import { UniversitiesService } from 'src/universities/universities.service';
import { UsersService } from 'src/users/users.service';
import { ResourceProtectionGuard } from '../auth/guards/resource-protection.guard';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { GetCitiesAddressesApiDoc } from './api-docs/get-cities-addresses.api-doc';
import { CreateAddressApiDoc } from './api-docs/create-address.api-doc';
import { FindAllAddressesApiDoc } from './api-docs/find-all-addresses.api-doc';
import { FindOneAddressApiDoc } from './api-docs/find-one-address.api-doc';
import { UpdateAddressApiDoc } from './api-docs/update-address.api-doc';
import { RemoveAddressApiDoc } from './api-docs/remove-address.api-doc';

@ApiTags('addresses')
@Controller('addresses')
export class AddressesController {
  constructor(
    private readonly addressesService: AddressesService,
    private readonly usersService: UsersService,
    private readonly universitiesService: UniversitiesService,
    private readonly campusesService: CampusesService,
    @InjectModel(Campus.name)
    private campusModel: Model<CampusDocument>,
  ) { }

  @Get('cities')
  @GetCitiesAddressesApiDoc()
  async getCities(@Query('trim', new ParseBoolPipe({ optional: true })) trim?: boolean) {
    return await this.addressesService.getCities(trim ?? false);
  }

  // @ApiOperation({ summary: 'Create an address by a campus admin', deprecated: true, description: 'This endpoint is deprecated. Please use the admin/address endpoint instead to create an address for a university.' })
  // @UseGuards(ResourceProtectionGuard)
  // @Post()
  // create(@Body() createAddressDto: CreateAddressDto, @Req() req: Request) {
  //   const userId = req.user['sub'];
  //   return this.addressesService.create(createAddressDto, userId);
  // }
  @UseGuards(ResourceProtectionGuard)
  @Post()
  @CreateAddressApiDoc()
  async create(@Body() createAddressDto: CreateAddressDto, @AuthReq() authReq: AuthenticatedRequest) {

    // ? Temporarily disabled the campus admin check for now
    // const campusId = authReq.user.campus_id;
    // if (!campusId) {
    //   throw new ForbiddenException('User is not a campus admin');
    // }
    return this.addressesService.create(createAddressDto, authReq.user.sub);
  }


  @Get()
  @FindAllAddressesApiDoc()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('order') order: string = 'desc',
  ) {
    return this.addressesService.findAll(page, limit, sortBy, order as any);
  }


  @Get(':id')
  @FindOneAddressApiDoc()
  findOne(@Param('id') id: string) {
    return this.addressesService.findOne(id);
  }

  @UseGuards(ResourceProtectionGuard)
  @Patch(':addressId')
  @UpdateAddressApiDoc()
  async update(
    @AuthReq() authReq: AuthenticatedRequest,
    @Param('addressId', ParseObjectIdPipe) addressId: Types.ObjectId,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const userId = authReq.user.sub;
    const isCampusAdmin = !!authReq.user.campus_id;


    // TODO: Only the admins should be able to update the address; regular student should not be able to update the address

    // If user is a campus admin, they can update the address of the campus they are an admin of
    if (isCampusAdmin) {

      let allowedAddressIds: Types.ObjectId[] = [];


      const { campus, universityId } = await this.usersService.getUserCampusInfo(userId);
      const isPrimaryCampusAdmin = campus.is_primary;
      // get university from university_id
      const university = await this.universitiesService.findById(
        universityId,
      );

      // get the campuses with the associated university
      const campuses = await this.campusModel.find({ university_id: universityId }).lean();
      const addressesOfAllCampusesOfUniversity = campuses.map(campus => campus.address_id);


      // get the campuses with the associated university
      const campusAddress = campus.address_id;
      const universityAddress = university.address_id


      // If user is a primary campus admin, they can update the address of the university and all the campuses of the university
      if (isPrimaryCampusAdmin) {
        // add the university's address and all the campuses' addresses to the allowed address ids
        allowedAddressIds.push(...addressesOfAllCampusesOfUniversity);
        allowedAddressIds.push(universityAddress._id);
      } else {
        allowedAddressIds.push(campusAddress);
      }

      const isAllowedAddress = allowedAddressIds.some(allowedAddressId => allowedAddressId.equals(addressId));

      if (!isAllowedAddress) {
        throw new ForbiddenException('You are not authorized to update this address');
      }

    }

    // If user is a student, they can update any address

    return this.addressesService.update(addressId, updateAddressDto);
  }

  @UseGuards(ResourceProtectionGuard)
  @Delete(':id')
  @RemoveAddressApiDoc()
  remove(@Param('id') id: string) {
    return this.addressesService.remove(id);
  }
}