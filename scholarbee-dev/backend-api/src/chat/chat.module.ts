import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { Campus, CampusSchema } from '../campuses/schemas/campus.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ChatSessionService } from './chat-session.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatCronService } from './chat-cron.service';
import { ConversationModelModule } from './conversation-models.module';
import { Message, MessageSchema } from './schemas/message.schema';
import { CampusAdminCacheService } from 'src/common/services/campus-admin-cache.service';
import { CampusesModule } from '../campuses/campuses.module';
import { EmailTemplatesModule } from 'src/email-templates/email-templates.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    ConversationModelModule,
    forwardRef(() => CampusesModule),
    EmailTemplatesModule,
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
      { name: Campus.name, schema: CampusSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    ChatSessionService,
    CampusAdminCacheService,
    ChatCronService,
  ],
  exports: [
    ChatService,
    ChatGateway,
    ChatSessionService,
    CampusAdminCacheService,
  ],
})
export class ChatModule { }
