import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UserTypeormRepository } from 'src/Infrastructure/Repository/typeorm/user.typeorm.repository';
import { UserSchema } from 'src/Shared/Infrastructure/Persistence/typeorm/user.schema';
import { CompanySchema } from 'src/Shared/Infrastructure/Persistence/typeorm/company.schema';
import { CompanyTypeormRepository } from 'src/Infrastructure/Repository/typeorm/company.typeorm.repository';
import { CompanyRepository } from 'src/Shared/Domain/Repository/company.repository';
import { UserRepository } from 'src/Shared/Domain/Repository/user.repository';
import { LoginUserQueryHandler } from 'src/Shared/Application/Query/User/LoginUserQueryHandler';
import { ConfirmUserCommandHandler } from 'src/Shared/Application/Command/ConfirmUserCommandHandler';
import { GetCompleteUserQueryHandler } from 'src/Shared/Application/Query/User/GetCompleteUserQueryHandler';
import { UserCreator } from 'src/Shared/Application/Service/UserCreator';
import { SignupUserCommandHandler } from 'src/Shared/Application/Command/SignupUserCommandHandler';

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
    // MailerService,
    {
      provide: UserRepository,
      useClass: UserTypeormRepository,
    },
    {
      provide: CompanyRepository,
      useClass: CompanyTypeormRepository, 
    },
    {
      provide: 'UserCreator',
      useClass: UserCreator, 
    },
    SignupUserCommandHandler,
    LoginUserQueryHandler,
    ConfirmUserCommandHandler,
    GetCompleteUserQueryHandler
  ]
})
export class UsersModule {}
