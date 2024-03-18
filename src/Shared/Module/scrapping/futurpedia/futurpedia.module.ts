import { Module } from '@nestjs/common';
import { FuturpediaController } from './futurpedia.controller';
import { FuturpediaService } from 'src/Shared/Service/scrapping/futurpedia.service';


@Module({
    controllers: [FuturpediaController],
    providers: [FuturpediaService]
 })
export class FuturpediaModule {}
