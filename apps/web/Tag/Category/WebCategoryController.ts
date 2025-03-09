import { Body, Controller, Get, Post } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { getAllCategoriesDto } from 'src/web/Application/Dto/Tag/getAllCategories.dto';
import { SearchCategoriesQuery } from 'src/web/Category/Application/Search/SearchCategoriesQuery';
import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';

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
