import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    UseGuards,
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ResourceProtectionGuard } from 'src/auth/guards/resource-protection.guard';
import { AuthReq } from 'src/auth/decorators/auth-req.decorator';
import { AuthenticatedRequest } from 'src/auth/types/auth.interface';
import { CreateReferralDto } from '../dto/create-referral.dto';
import { ReferenceSystemService } from '../services/reference-system.service';
import { CreateReferralApiDoc } from '../api-docs/create-referral.api-doc';
import { GetMyReferralsApiDoc } from '../api-docs/get-my-referrals.api-doc';
import { FindReferralByCodeApiDoc } from '../api-docs/find-referral-by-code.api-doc';

@ApiTags('reference-system')
@Controller('reference-system')
@UseGuards(ResourceProtectionGuard)
@ApiBearerAuth()
export class ReferenceSystemController {
    constructor(
        private readonly referenceSystemService: ReferenceSystemService,
    ) { }

    @Post('referrals')
    @CreateReferralApiDoc()
    async createReferral(
        @Body() createReferralDto: CreateReferralDto,
        @AuthReq() req: AuthenticatedRequest,
    ) {
        try {
            const ownerId = req.user.sub;
            return await this.referenceSystemService.createReferral(
                createReferralDto,
                ownerId,
            );
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof ConflictException
            ) {
                throw error;
            }
            throw new BadRequestException(error.message);
        }
    }

    @Get('referrals')
    @GetMyReferralsApiDoc()
    async getMyReferrals(@AuthReq() req: AuthenticatedRequest) {
        try {
            const ownerId = req.user.sub;
            return await this.referenceSystemService.getReferralsByOwner(ownerId);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(error.message);
        }
    }

    @Get('referrals/code/:code')
    @FindReferralByCodeApiDoc()
    async findReferralByCode(@Param('code') code: string) {
        try {
            return await this.referenceSystemService.findReferralByCode(code);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(error.message);
        }
    }
}

