import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UserTypeormRepository } from 'src/Infrastructure/Repository/typeorm/user.typeorm.repository';
import { CreateUserCommandHandler } from 'src/Application/command/user/CreateUserCommandHandler';
import { UserSchema } from 'src/Shared/Infrastructure/Persistence/typeorm/user.schema';
import { UserRepository } from 'src/Domain/Repository/user.repository';
import { CompanyRepository } from 'src/Domain/Repository/company.repository';
import { CompanySchema } from 'src/Shared/Infrastructure/Persistence/typeorm/company.schema';
import { CompanyTypeormRepository } from 'src/Infrastructure/Repository/typeorm/company.typeorm.repository';

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
