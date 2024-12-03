import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTypeormRepository } from 'src/Infrastructure/Repository/typeorm/user.typeorm.repository';
import { UserSchema } from 'src/Shared/Infrastructure/Persistence/typeorm/user.schema';
import { UserRepository } from 'src/Shared/Domain/Repository/user.repository';
import { GetCompleteUserQueryHandler } from 'src/Shared/Application/Query/User/GetCompleteUserQueryHandler';
import { UserCreator } from 'src/Shared/Application/Service/UserCreator';
import { AuthController } from './auth.controller';
import { LoginUserCommandHandler } from 'src/Shared/Application/Command/User/LoginUserCommandHandler';
import { JwtModule } from '@nestjs/jwt';
import { SignupUserCommandHandler } from 'src/Shared/Application/Command/User/SignupUserCommandHandler';
import { GetAuthTokenQueryHandler } from 'src/Shared/Application/Query/User/GetAuthTokenQueryHandler';

export const jwtConstants = {
  secret: 'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};


@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserSchema,
      UserRepository
    ]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    CqrsModule
  ],
  controllers: [AuthController],
  providers: [
    LoginUserCommandHandler,
    SignupUserCommandHandler,
    GetAuthTokenQueryHandler,
    {
      provide: UserRepository,
      useClass: UserTypeormRepository,
    },
    {
      provide: 'UserCreator',
      useClass: UserCreator, 
    }
  ]
})
export class AuthModule {}
