import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTypeormRepository } from 'src/Infrastructure/Repository/typeorm/user.typeorm.repository';
import { UserSchema } from 'src/Shared/Infrastructure/Persistence/typeorm/user.schema';
import { UserRepository } from 'src/Shared/Domain/Repository/user.repository';
import { UserCreator } from 'src/Shared/Application/Service/UserCreator';
import { AuthController } from './auth.controller';
import { LoginUserCommandHandler } from 'src/Shared/Application/Command/User/LoginUserCommandHandler';
import { JwtModule } from '@nestjs/jwt';
import { SignupUserCommandHandler } from 'src/Shared/Application/Command/User/SignupUserCommandHandler';
import { GetAuthTokenQueryHandler } from 'src/Shared/Application/Query/User/GetAuthTokenQueryHandler';
import { jwtConstants } from 'src/Shared/Infrastructure/jwt/constants';
import { UserWebRepository } from 'src/web/Domain/Repository/UserWeb/UserWebRepository';
import { TypeormUserWebRepository } from 'src/web/Infrastructure/Repository/UserWeb/TypeormUserWebRepository';


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
      provide: UserWebRepository,
      useClass: TypeormUserWebRepository,
    },
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
