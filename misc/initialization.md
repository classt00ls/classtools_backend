## Pasos seguidos en el desarrollo del framework
### Instalación de nestjs
    npm i -g @nestjs/cli
### Instalación de typeorm
    npm install --save @nestjs/typeorm typeorm mysql2
### Implementación de typeorm en appmodule
```typescript
let databaseConfig: Partial<TypeOrmModuleOptions>;

switch (process.env.NODE_ENV) {
  case 'dev':
  case 'test':
  case 'development':
    databaseConfig = {
      type        : 'sqlite',
      synchronize : true,
      database    : process.env.DB_NAME,
    };
  break;
  default:
    databaseConfig = {
      type        : 'mariadb',
      synchronize : true, // TODO !! This can be dangerous
      database    : process.env.DB_NAME,
      username    : process.env.DB_USER,
      password    : process.env.DB_PASSWORD,
    };
  break;
}
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return { 
          ...databaseConfig,
          entities: []
        }
      }
    }),
  // UsersModule
  UtilsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```