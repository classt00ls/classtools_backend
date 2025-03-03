import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UpgradeTagToCategoryCommand } from '@Backoffice/Application/Command/Tag/UpgradeTagToCategoryCommand';
import { UpgradeTagRequest } from '@Backoffice/Application/Request/Tag/UpgradeTagRequest';

@Controller('backoffice/category')
export class BackofficeCategoryController {
  constructor(
    private readonly commandBus: CommandBus
  ) {}

  @Post('upgrade')
  async upgrade(
    @Body() upgradeTagRequest?: UpgradeTagRequest
  ) {

    await this.commandBus.execute(
      new UpgradeTagToCategoryCommand(
        upgradeTagRequest.id
      )
    );

  }

  @Get('')
  async getJson() {
    
  }
  
}
