import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { createToolSchema } from '@Backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from '@Backoffice/Tool/Domain/tool.repository';
import { ToolTypeormRepository } from './tool.typeorm.repository';

export const TOOL_TABLE_SUFFIX = 'TOOL_TABLE_SUFFIX';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            createToolSchema(process.env.TOOL_TABLE_SUFFIX || ''),
        ]),
    ],
    providers: [
        {
            provide: TOOL_TABLE_SUFFIX,
            useValue: process.env.TOOL_TABLE_SUFFIX || ''
        },
        {
            provide: ToolRepository,
            useFactory: (dataSource: DataSource, suffix: string) => {
                return new ToolTypeormRepository(dataSource, suffix);
            },
            inject: [DataSource, TOOL_TABLE_SUFFIX]
        }
    ],
    exports: [
        TypeOrmModule,
        ToolRepository,
        TOOL_TABLE_SUFFIX
    ]
})
export class ToolRepositoryModule {} 