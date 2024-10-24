import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UserTypeormRepository } from 'src/Infrastructure/Repository/typeorm/user.typeorm.repository';
import { CreateUserCommandHandler } from 'src/Shared/Application/Command/CreateUserCommandHandler';
import { UserSchema } from 'src/Shared/Infrastructure/Persistence/typeorm/user.schema';
import { CompanySchema } from 'src/Shared/Infrastructure/Persistence/typeorm/company.schema';
import { CompanyTypeormRepository } from 'src/Infrastructure/Repository/typeorm/company.typeorm.repository';
import { CompanyRepository } from 'src/Shared/Domain/Repository/company.repository';
import { UserRepository } from 'src/Shared/Domain/Repository/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserSchema,
      CompanySchema,
      UserRepository,
      CompanyRepository 
    ]),
    CqrsModule
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: UserRepository,
      useClass: UserTypeormRepository,
    },
    {
      provide: CompanyRepository,
      useClass: CompanyTypeormRepository,
    },
    CreateUserCommandHandler
  ]
})
export class UsersModule {}
