import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from 'src/Shared/Domain/Repository/tool.repository';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagRepository } from 'src/Shared/Domain/Repository/tag.repository';
import { BackofficeTagController } from './BackofficeTagController';
import { BackofficeCategoryController } from './Category/BackofficeCategoryController';
import { UpgradeTagToCategoryCommandHandler } from 'src/backoffice/Application/Command/Tag/UpgradeTagToCategoryCommandHandler';
import { UpdateTagCommandHandler } from 'src/backoffice/Application/Command/Tag/UpdateTagCommandHandler';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchema,
            ToolRepository
          ]),
        CqrsModule
    ],
    controllers: [
        BackofficeTagController,
        BackofficeCategoryController
    ],
    providers: [
        UpdateTagCommandHandler,
        UpgradeTagToCategoryCommandHandler,
        {
            provide: TagRepository,
            useClass: TagTypeormRepository,
        }
    ]
 })
export class BackofficeTagModule {}
