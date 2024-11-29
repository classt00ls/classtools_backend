import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormUserWebRepository } from 'src/web/Infrastructure/Repository/UserWeb/TypeormUserWebRepository';
import { UserWebRepository } from 'src/web/Domain/Repository/UserWeb/UserWebRepository';
import { UserWebSchema } from 'src/web/Infrastructure/Persistence/typeorm/DatabaseWebUser.schema';
import { UserWebController } from './UserWeb.controller';
import { UserWebCreator } from 'src/Web/Application/Service/UserWeb/UserWebCreator';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserWebSchema,
            UserWebRepository
          ]),
        CqrsModule
    ],
    controllers: [
        UserWebController
    ],
    providers: [
        {
            provide: UserWebRepository,
            useClass: TypeormUserWebRepository
        },
        UserWebCreator
    ]
 })
export class UserWebModule {}
