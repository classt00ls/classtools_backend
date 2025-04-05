import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from '@backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from '@backoffice/Tool/Domain/tool.repository';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagRepository } from '@backoffice/Tag/Domain/tag.repository';
import { BackofficeTagController } from './BackofficeTagController';
import { BackofficeCategoryController } from './Category/BackofficeCategoryController';
import { UpgradeTagToCategoryCommandHandler } from '@backoffice/Application/Command/Tag/UpgradeTagToCategoryCommandHandler';
import { UpdateTagCommandHandler } from '@backoffice/Application/Command/Tag/UpdateTagCommandHandler';
import { ToolAssignedListener } from '@Web/Category/Domain/ToolAssignedListener';
import { CategoryCreator } from '@Web/Category/Application/Create/CategoryCreator';
import { CategoryRepository } from '@Web/Category/Domain/category.repository';
import { CategoryMysqlRepository } from '@Web/Category/Infrastructure/Persistence/TypeOrm/category.mysql.repository';
import { ToolTypeormRepository } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.typeorm.repository';
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
        ToolAssignedListener,
        CategoryCreator,
        UpdateTagCommandHandler,
        UpgradeTagToCategoryCommandHandler,
        {
            provide: TagRepository,
            useClass: TagTypeormRepository,
        },
        {
            provide: CategoryRepository,
            useClass: CategoryMysqlRepository,
        }
    ]
 })
export class BackofficeTagModule {}
