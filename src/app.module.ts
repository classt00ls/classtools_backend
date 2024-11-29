import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilsModule } from './Shared/Module/utils/utils.module';
import { UsersModule } from '../apps/Shared/User/users.module';
import { ConfigModule } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ToolModule } from 'apps/web/Tool/tool.module';
import { TagModule } from 'apps/web/Tag/tag.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BackofficeToolModule } from 'apps/backoffice/Tool/BackofficeToolModule';
import { BackofficeTagModule } from 'apps/backoffice/Tag/BackofficeTagModule';
import { BackofficeFuturpediaToolModule } from 'apps/backoffice/Tool/Futurpedia/BackofficeFuturpediaToolModule';
import { OpenAIModule } from 'apps/discover/Tool/openAI/OpenAIModule';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { CurrentUserMiddleware } from './Shared/Infrastructure/middlewares/current-user.middleware';
import { LangChainModule } from 'apps/discover/Server/LangChain/LangChainModule';
import { UserToolSuggestionsModule } from 'apps/web/UserToolSuggestions/UserToolSuggestions.module';
import { SharedUserListener } from './web/Application/Listener/Shared/SharedUserListener';
import { UserWebCreator } from './web/Application/Service/UserWeb/UserWebCreator';
import { UserWebRepository } from './web/Domain/Repository/UserWeb/UserWebRepository';
import { TypeormUserWebRepository } from './web/Infrastructure/Repository/UserWeb/TypeormUserWebRepository';
import { UserWebModule } from 'apps/web/UserWeb/UserWeb.module';

const cookieSession = require('cookie-session');

let databaseConfig: Partial<TypeOrmModuleOptions>; 

switch (process.env.NODE_ENV) {
  case 'dev':
  case 'test':
  case 'development':
    databaseConfig = {
      type        : 'sqlite',
      synchronize : true,
      autoLoadEntities: true,
      database    : process.env.DB_NAME,
    };
  break;
  default:
    databaseConfig = {
      type        : 'mariadb',
      synchronize : true, // TODO !! This can be dangerous
      autoLoadEntities: true,
      database    : process.env.DB_NAME,
      username    : process.env.DB_USER,
      password    : process.env.DB_PASSWORD,
    };
  break;
}
@Module({
  imports: [
    ToolModule,
    TagModule,
    BackofficeTagModule,
    BackofficeToolModule,
    BackofficeFuturpediaToolModule,
    OpenAIModule,
    LangChainModule, 
    UsersModule,
    UserWebModule,
    UserToolSuggestionsModule,
    EventEmitterModule.forRoot({
      // set this to `true` to use wildcards
      wildcard: false,
      // the delimiter used to segment namespaces
      delimiter: '.',
      // set this to `true` if you want to emit the newListener event
      newListener: false,
      // set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // disable throwing uncaughtException if an error event is emitted and it has no listeners
      ignoreErrors: false,
    }),
    
    ConfigModule.forRoot(
      {isGlobal: true,  envFilePath: process.env.NODE_ENV == 'dev' ? '.env.development' : '.env'}
    ),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return { 
          ...databaseConfig
        }
      }
    }),
    MailerModule.forRoot({
      // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
      // or
      transport: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT),
        secure: process.env.MAIL_SECURE == "true" ? true: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: '"No Reply" <cars@spotileads.com>',
      },
      template: {
        dir: join(__dirname, '../../../public/assets'),
        adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
        options: {
          strict: true,
        },
      },
    }),
  UsersModule,
  UtilsModule
],
  controllers: [AppController],
  providers: [
    AppService,
    QueryBus,
    CommandBus
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: ['marmota'],
          maxAge: 5 * 60 * 60 * 1000 // 5 hour
        }),
        
      ).forRoutes('*');
    consumer
      .apply(CurrentUserMiddleware)
      .forRoutes('*');
  }
}
