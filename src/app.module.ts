import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilsModule } from './Shared/Module/utils/utils.module';
import { UsersModule } from './Ui/User/users.module';
import { ConfigModule } from '@nestjs/config';
import { FuturpediaModule } from './Ui/Tools/futurpedia/futurpedia.module';
import { QueryBus } from '@nestjs/cqrs';

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
    FuturpediaModule,
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
    QueryBus
  ],
})
export class AppModule {}
