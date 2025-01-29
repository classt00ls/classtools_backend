import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { UserTypeormRepository } from 'src/Infrastructure/Repository/typeorm/user.typeorm.repository';
import { UserSchema } from                '@Shared/Infrastructure/Persistence/typeorm/user.schema';
import { UserRepository } from            '@Shared/Domain/Repository/user.repository';
import { UserCreator } from               '@Shared/Application/Service/UserCreator';
import { LoginUserCommandHandler } from   '@Shared/Application/Command/User/LoginUserCommandHandler';
import { SignupUserCommandHandler } from  '@Shared/Application/Command/User/SignupUserCommandHandler';
import { jwtConstants } from              '@Shared/Infrastructure/jwt/constants';

import { UserWebRepository } from         '@Web/Domain/Repository/UserWeb/UserWebRepository';
import { TypeormUserWebRepository } from  '@Web/Infrastructure/Repository/UserWeb/TypeormUserWebRepository';

import { WebAuthController } from         '@web/auth/web-auth.controller';
import { GetAuthTokenFromEmailQueryHandler } from '@Web/Application/Query/Auth/GetAuthTokenFromEmailQueryHandler';
import { GetUsuarioFromTokenQueryHandler } from '@Web/Application/Query/Auth/GetUsuarioFromTokenQueryHandler';
import { UserWebExtractor } from '@Web/Domain/Service/UserWeb/UserWebExtractor';
import { UserWebExtractorFromFirebaseOrJwt } from '@Web/Infrastructure/Service/UserWeb/UserWebExtractorFromFirebaseOrJwt';
import { UserWebExtractorFromFirebase } from '@Web/Infrastructure/Service/UserWeb/UserWebExtractorFromFirebase';
import { UserWebExtractorFromJwt } from '@Web/Infrastructure/Service/UserWeb/UserWebExtractorFromJwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserSchema,
      UserRepository
    ]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '2h' }, 
    }),
    CqrsModule
  ],
  controllers: [WebAuthController],
  providers: [
    LoginUserCommandHandler,
    SignupUserCommandHandler,
    UserWebExtractorFromFirebase,
    UserWebExtractorFromJwt,
    GetAuthTokenFromEmailQueryHandler,
    GetUsuarioFromTokenQueryHandler,
    {
      provide: UserWebRepository,
      useClass: TypeormUserWebRepository,
    },
    {
      provide: UserWebExtractor,
      useClass: UserWebExtractorFromFirebaseOrJwt,
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
export class WebAuthModule {}
