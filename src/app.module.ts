import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RouterModule, DiscoveryModule } from '@nestjs/core';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilsModule } from './Shared/Module/utils/utils.module';
import { UsersModule } from '../apps/Shared/User/users.module';
import { ConfigModule } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { BackofficeToolModule } from 'apps/backoffice/Tool/BackofficeToolModule';
import { BackofficeTagModule } from 'apps/backoffice/Controller/Tag/BackofficeTagModule';
import { OpenAIModule } from 'apps/discover/Tool/openAI/OpenAIModule';

import { CurrentUserMiddleware } from '@Shared/Infrastructure/middlewares/current-user.middleware';
import { LangChainModule } from 'apps/discover/Server/LangChain/LangChainModule';

import { DiscoverAuthModule } from 'apps/discover/auth/auth.module';
import { DiscoverToolModule } from 'apps/discover/Tool/DiscoverToolModule';

import { ToolModule } from                '@web/Tool/tool.module';
import { TagModule } from                 '@web/Tag/tag.module';
import { UserToolSuggestionsModule } from '@web/UserToolSuggestions/UserToolSuggestions.module';
import { UserWebModule } from             '@web/UserWeb/UserWeb.module';
import { webRoutes } from                 '@web/web.routes';
import { WebAuthModule } from             '@web/auth/web-auth.module';
import { ToolSearchModule } from '@web/Tool/search/tool.search.module';
import { GoogleGeminiProvider } from '@Shared/Infrastructure/IA/GoogleGeminiProvider';
import { AgentModule } from 'apps/discover/Agent/AgentModule';
import { ToolCreatedListener } from '@Web/Tool/Domain/ToolCreatedListener';
import { ChatTogetherModelProvider } from '@Shared/Infrastructure/IA/ChatTogetherModelProvider';
import { EventModule } from './Shared/Infrastructure/Event/event.module';
import { EventAutoRegister } from '@Events/Event/Infrastructure/event-auto-register';
import { ConsumeEventsModule } from 'apps/backoffice/Event/ConsumeEventsModule';
import { ToolAssignedListener } from '@Web/Category/Domain/ToolAssignedListener';
import { EmbeddingModule } from '@Shared/Embedding/embedding.module';
import { TestingModule } from 'apps/Shared/Testing';
import { DatabaseTestModule } from 'apps/Shared/database-test/database-test.module';

const cookieSession = require('cookie-session');

// Usar la URL de conexión desde las variables de entorno
const DATABASE_URL = process.env.DATABASE_URL;

const databaseConfig: Partial<TypeOrmModuleOptions>[] = [{
  type: 'postgres',
  url: DATABASE_URL,
  synchronize: true,
  autoLoadEntities: true,
  ssl: { rejectUnauthorized: false },
}];


const databaseModules = databaseConfig.map((config) =>
  TypeOrmModule.forRootAsync({
    useFactory: () => {
      console.log('⏳ Inicializando conexión TypeORM a la base de datos con URL directa...');
      return {...config};
    },
  })
);


@Module({
  imports: [
    EmbeddingModule,
    DiscoveryModule,
    RouterModule.register(webRoutes),
    ToolModule, 
    ToolSearchModule,   
    DiscoverToolModule,
    DiscoverAuthModule,
    ConsumeEventsModule,
    AgentModule,
    TagModule,
    BackofficeTagModule,
    BackofficeToolModule,
    OpenAIModule,
    LangChainModule, 
    UsersModule,
    UserWebModule,
    UserToolSuggestionsModule,
    WebAuthModule,
    EventModule,
    TestingModule,
    DatabaseTestModule,
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
    ...databaseModules,
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
    ChatTogetherModelProvider,
    ToolCreatedListener,
    GoogleGeminiProvider,
    AppService,
    QueryBus,
    CommandBus,
    EventAutoRegister
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
