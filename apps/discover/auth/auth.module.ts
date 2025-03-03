import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from 'src/Shared/Domain/Repository/tool.repository';
import { TagRepository } from 'src/Shared/Domain/Repository/tag.repository';
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
