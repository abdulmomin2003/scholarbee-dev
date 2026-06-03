import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateGlobalNotificationDto, CreateSpecificNotificationDto } from '../dto/create-notification.dto';

export function CreateGlobalUserNotificationApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Create global user notification (test)', description: 'Create a notification for all users. Test endpoint.' }),
        ApiBody({
            type: CreateGlobalNotificationDto,
            examples: {
                default: {
                    value: {
                        title: 'System Update',
                        message: 'We have updated our system with new features.'
                    }
                }
            }
        }),
        ApiResponse({ status: 201, description: 'Notification created', schema: { example: { _id: '6512not01', title: 'System Update' } } }),
    );
}

export function CreateSpecificUsersNotificationApiDoc() {
    return applyDecorators(
        ApiBearerAuth(),
        ApiOperation({ summary: 'Create notification for specific users (test)', description: 'Create a notification for specific user IDs. Test endpoint.' }),
        ApiBody({
            type: CreateSpecificNotificationDto,
            examples: {
                default: {
                    value: {
                        title: 'Application Update',
                        message: 'Your application status has changed.',
                        userIds: ['651234abcd5678ef9012u001', '651234abcd5678ef9012u002']
                    }
                }
            }
        }),
        ApiResponse({ status: 201, description: 'Notification created', schema: { example: { _id: '6512not01' } } }),
    );
}

