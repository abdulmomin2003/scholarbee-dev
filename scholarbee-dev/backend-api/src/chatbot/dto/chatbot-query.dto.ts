import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ChatbotQueryDto {
  @ApiProperty({ description: 'User message to the AI assistant' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  query: string;

  @ApiPropertyOptional({
    description: 'Client session id for conversation continuity',
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  sessionId?: string;
}
