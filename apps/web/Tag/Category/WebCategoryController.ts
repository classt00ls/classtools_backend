import { Body, Controller, Get, Post } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { getAllCategoriesDto } from '@Web/Application/Dto/Tag/getAllCategories.dto';
import { SearchCategoriesQuery } from '@Web/Category/Application/Search/SearchCategoriesQuery';
import { Serialize } from '@Web/Infrastructure/interceptors/serialize.interceptor';

@Controller('web/category')
export class WebCategoryController {
  constructor(
    private readonly queryBus: QueryBus
  ) {}

  @Get('')
  @Serialize(getAllCategoriesDto)
  async getAll() {
    return this.queryBus.execute(
      new SearchCategoriesQuery()
    )
  }
  
}
