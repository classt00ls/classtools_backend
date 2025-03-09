import { Module } from '@nestjs/common';
import { ToolAssignedListener } from './Domain/ToolAssignedListener';

@Module({
    providers: [
        ToolAssignedListener
    ]
})
export class CategoryModule {} 