import { GenericFilter } from "../../../Shared/Application/Filter/GenericFilter";

export class ToolLangFilter extends GenericFilter {
  
  constructor (
    private tags: string[],
    private stars: number,
    private title: string = '',
    private prompt: string = '',
    private lang: string = 'es',
    page: number = 1,
    pageSize: number = 15,
    orderBy?: string
  ) {
    super(page, pageSize, orderBy);
  }

  public static fromFilterDto(
    filter: any,
    page: number = 1,
    pageSize: number = 15
  ) {
    return new ToolLangFilter(
      filter.selectedCategories || [],
      filter.stars || 0,
      filter.title || '',
      filter.prompt || '',
      filter.lang || 'es',
      page,
      pageSize
    );
  }

  public toPrimitives() {
    return {
      ...super.toPrimitives(),
      tags: this.tags,
      stars: this.stars,
      title: this.title,
      prompt: this.prompt,
      lang: this.lang
    };
  }

  public getTags(): Array<string> {
    return this.tags;
  }

  public getStars(): number {
    return Number(this.stars);
  }

  public getTitle(): string {
    return this.title;
  }

  public getPrompt(): string {
    return this.prompt;
  }

  public getLang(): string {
    return this.lang;
  }
} 