import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseTestController } from './database-test.controller';

@Module({
  imports: [
    ConfigModule
  ],
  controllers: [DatabaseTestController],
})
export class DatabaseTestModule {} 