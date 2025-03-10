import { DataSource } from 'typeorm';
import { ToolTypeormRepository } from './tool.typeorm.repository';

export const TOOL_TABLE_SUFFIX = 'TOOL_TABLE_SUFFIX';

export const toolTypeormRepositoryFactory = {
    provide: 'ToolRepository',
    useFactory: (dataSource: DataSource, suffix: string) => {
        return new ToolTypeormRepository(dataSource, suffix);
    },
    inject: [DataSource, TOOL_TABLE_SUFFIX],
};

export const toolTableSuffixProvider = {
    provide: TOOL_TABLE_SUFFIX,
    useValue: process.env.TOOL_TABLE_SUFFIX || ''
}; 