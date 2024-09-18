import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilsModule } from './Shared/Module/utils/utils.module';
import { UsersModule } from './Ui/User/users.module';
import { ConfigModule } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ToolModule } from 'apps/web/Tool/tool.module';
import { TagModule } from 'apps/web/Tag/tag.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

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
      {isGlobal: true}
    ),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return { 
          ...databaseConfig
        }
      }
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
export class AppModule {}
