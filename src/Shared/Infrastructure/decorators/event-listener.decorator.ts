import { Type } from '@nestjs/common';

export function EventListener(eventType: string) {
    return function <T extends Type<any>>(target: T) {
        Reflect.defineMetadata('eventType', eventType, target);
    };
} 