import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from '@Backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from '@Backoffice/Tool/Domain/tool.repository';
import { AgentController } from './AgentController';
import { RespondMessage } from 'src/discover/Agent/Application/RespondMessage';
import { ChatTogetherModelProvider } from 'src/discover/Agent/Infrastructure/ChatTogetherModelProvider';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchema,
            ToolRepository
          ]),
        CqrsModule
    ],
    controllers: [
        AgentController
    ],
    providers: [
        RespondMessage,
        ChatTogetherModelProvider
    ]
 })
export class AgentModule {} 
