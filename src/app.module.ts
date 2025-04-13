import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RouterModule, DiscoveryModule } from '@nestjs/core';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilsModule } from './Shared/Module/utils/utils.module';
import { UsersModule } from '../apps/Shared/User/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { EmbeddingModule } from '@Shared/Embedding/embedding.module';
import { TestingModule } from 'apps/Shared/Testing';
import { DatabaseTestModule } from 'apps/Shared/database-test/database-test.module';

const cookieSession = require('cookie-session');

// Eliminamos configuración directa desde process.env
// const DATABASE_URL = process.env.DATABASE_URL || '';

// Usamos ConfigModule para gestionar las variables de entorno
const databaseModules = [
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const databaseUrl = configService.get<string>('DATABASE_URL');
      console.log('🔍 app.module.ts: DATABASE_URL existe:', !!databaseUrl);
      
      if (databaseUrl) {
        // Mostrar URL sanitizada para debugging
        const safeUrl = databaseUrl.replace(/:[^:]*@/, ':****@');
        console.log('🔍 app.module.ts: URL de conexión sanitizada:', safeUrl);
      } else {
        console.error('⚠️ ERROR: DATABASE_URL no está configurada');
      }
      
      console.log('🔍 app.module.ts: Tipo de DATABASE_URL:', typeof databaseUrl);
      
      return {
        type: 'postgres',
        url: databaseUrl,
        synchronize: true,
        autoLoadEntities: true, 
        ssl: false,
      };
    },
  })
];

@Module({
  imports: [
    // Configurar ConfigModule correctamente, con carga del archivo .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Añadir DiscoveryModule para EventAutoRegister
    DiscoveryModule,
    
    // Resto de los módulos
    ...databaseModules,
    UtilsModule,
    UsersModule, 
    WebAuthModule,
    ToolModule,
    TagModule,
    DiscoverAuthModule,
    DiscoverToolModule,
    OpenAIModule,
    BackofficeToolModule,
    BackofficeTagModule,
    UserWebModule,
    UserToolSuggestionsModule,
    ToolSearchModule,
    AgentModule,
    LangChainModule,
    EventModule,
    ConsumeEventsModule,
    EmbeddingModule,
    TestingModule,
    DatabaseTestModule,

    EventEmitterModule.forRoot(),
    MailerModule.forRoot({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
      template: {
        dir: process.cwd() + '/templates/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),

    RouterModule.register(webRoutes),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CommandBus,
    QueryBus,
    ToolCreatedListener,
    // Providers
    {
      provide: 'ModelProvider',
      useClass: ChatTogetherModelProvider
    },
    EventAutoRegister
  ],
})
export class AppModule {

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieSession({
        keys: ['key1']
      }))
      .forRoutes('*');
    
    consumer
      .apply(CurrentUserMiddleware)
      .forRoutes('*');
  }
}
