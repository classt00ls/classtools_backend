import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from '@backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from '@backoffice/Tool/Domain/tool.repository';
import { TagRepository } from '@backoffice/Tag/Domain/tag.repository';
import { AuthController } from './auth.controller';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchema,
            ToolRepository
          ]),
        CqrsModule
    ],
    controllers: [
        AuthController
    ],
    providers: [
    ]
 })
export class DiscoverAuthModule {} 
