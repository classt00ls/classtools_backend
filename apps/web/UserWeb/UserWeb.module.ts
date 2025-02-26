import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormUserWebRepository } from '@Web/UserWeb/Infrastructure/Persistence/TypeOrm/TypeormUserWebRepository';
import { UserWebRepository } from '@Web/UserWeb/Domain/UserWebRepository';
import { UserWebSchema } from '@Web/UserWeb/Infrastructure/Persistence/TypeOrm/DatabaseWebUser.schema';
import { UserWebController } from './UserWeb.controller';
import { UserWebCreator } from '../../../src/web/UserWeb/Domain/UserWebCreator';
import { CreateUserWebOnSharedUserCreated } from '@Web/UserWeb/Domain/CreateUserWebOnSharedUserCreated';

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
        CreateUserWebOnSharedUserCreated,
        {
            provide: 'UserWebCreator',
            useClass: UserWebCreator
          },
        {
            provide: UserWebRepository,
            useClass: TypeormUserWebRepository
        }
    ]
 })
export class UserWebModule {}
