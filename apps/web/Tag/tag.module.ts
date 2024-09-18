import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagSchema } from 'src/Infrastructure/Persistence/typeorm/tag.schema';
import { TagRepository } from 'src/Domain/Repository/tag.repository';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagController } from './tag.controller';
import { GetAllTagsQueryHandler } from 'src/web/Application/Query/Tag/GetAllTagsQueryHandler';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            TagSchema,
            TagRepository
          ]),
        CqrsModule
    ],
    controllers: [
        TagController
    ],
    providers: [
        GetAllTagsQueryHandler,
        {
            provide: TagRepository,
            useClass: TagTypeormRepository,
        }
    ]
 })
export class TagModule {}
