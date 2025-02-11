import { GenericFilter } from "../../../Shared/Application/Filter/GenericFilter";

export class ToolFilter extends GenericFilter{
  
  constructor (
    private tags: string[],
    private stars: number,
    private title: string = '',
    page: number = 1,
    pageSize: number = 15,
    orderBy?: string
  ) {
    super(page, pageSize, orderBy);

  }

  /**
   * @param tags 
   * @param stars 
   */
  public static fromPagination(
    page: number = 1,
    pageSize: number = 15,
  ) {
    return new ToolFilter([], 0, "", page, pageSize);
  }

  /**
   * @param tags 
   * @param stars 
   */
  public static fromTagsAndStars(
    tags: string[],
    stars: number
  ) {
    return new ToolFilter(tags, stars);
  }

  /**
   * @param tags
   */
  public static fromTags(
    tags: string[]
  ) {
    return new ToolFilter(tags, 0);
  }

  public toPrimitives() {
    return Object.assign({
      tags: this.tags,
      stars: this.stars,
      title: this.title,
    }, ...this.toPrimitives());
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
  
}