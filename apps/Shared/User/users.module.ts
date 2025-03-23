import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTypeormRepository } from '../../../src/Infrastructure/Repository/typeorm/user.typeorm.repository';
import { UserSchema } from 'src/Shared/Infrastructure/Persistence/typeorm/user.schema';
import { CompanySchema } from 'src/Shared/Infrastructure/Persistence/typeorm/company.schema';
import { CompanyRepository } from 'src/Shared/Domain/Repository/company.repository';
import { UserRepository } from 'src/Shared/Domain/Repository/user.repository';
import { GetCompleteUserQueryHandler } from 'src/Shared/Application/Query/User/GetCompleteUserQueryHandler';
import { UserCreator } from 'src/Shared/Application/Service/UserCreator';
import { SignupUserCommandHandler } from 'src/Shared/Application/Command/User/SignupUserCommandHandler';
import { ConfirmUserCommandHandler } from 'src/Shared/Application/Command/User/ConfirmUserCommandHandler';

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
  // controllers: [UsersController],
  providers: [
    // MailerService,
    {
      provide: UserRepository,
      useClass: UserTypeormRepository,
    },
    {
      provide: 'UserCreator',
      useClass: UserCreator, 
    },
    SignupUserCommandHandler,
    ConfirmUserCommandHandler,
    GetCompleteUserQueryHandler
  ]
})
export class UsersModule {}
