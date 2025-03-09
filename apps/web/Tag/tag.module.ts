import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagSchema } from 'src/Shared/Infrastructure/Persistence/typeorm/tag.schema';
import { TagRepository } from '@Backoffice/Tag/Domain/tag.repository';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagController } from './tag.controller';
import { GetAllTagsQueryHandler } from 'src/web/Application/Query/Tag/GetAllTagsQueryHandler';
import { WebCategoryController } from './Category/WebCategoryController';
import { GetAllCategoriesQueryHandler } from 'src/web/Application/Query/Tag/Category/GetAllCategoriesQueryHandler';
import { SearchCategoriesQueryHandler } from 'src/web/Category/Application/Search/SearchCategoriesQueryHandler';
import { CategorySearcher } from '@Web/Category/Application/Search/CategorySearcher'; 
import { CategoryRepository } from '@Web/Category/Domain/category.repository';
import { CategoryMysqlRepository } from '@Web/Category/Infrastructure/Persistence/TypeOrm/category.mysql.repository'; 
import { CategorySchema } from '@Web/Category/Infrastructure/Persistence/TypeOrm/category.schema';
@Module({
    imports: [
        TypeOrmModule.forFeature([
            TagSchema,
            CategorySchema,
            TagRepository,
            CategoryRepository
          ]),
        CqrsModule
    ],
    controllers: [
        TagController,
        WebCategoryController
    ],
    providers: [
        GetAllTagsQueryHandler,
        CategorySearcher,
        GetAllCategoriesQueryHandler,
        SearchCategoriesQueryHandler,
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
export class TagModule {}
