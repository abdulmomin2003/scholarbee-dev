import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export enum ConversationReadStatusFilter {
    READ = 'read',
    UNREAD = 'unread',
}

export class GetConversationsCountQueryDto {
    @ApiPropertyOptional({
        enum: ConversationReadStatusFilter,
        description:
            'Filter conversations by read status from the requester perspective. Applies only when provided.',
    })
    @IsOptional()
    @IsEnum(ConversationReadStatusFilter)
    read_status?: ConversationReadStatusFilter;
}

export class ListConversationsQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        enum: ConversationReadStatusFilter,
        description:
            'Filter conversations by read status from the requester perspective. Applies only when provided.',
    })
    @IsOptional()
    @IsEnum(ConversationReadStatusFilter)
    read_status?: ConversationReadStatusFilter;
}

