import { GenericFilter } from "../GenericFilter";

export class ToolGenericFilter extends GenericFilter{
  
  constructor (
    private tags: string[],
    private stars: number,
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
  public static fromTagsAndStars(
    tags: string[],
    stars: number
  ) {
    return new ToolGenericFilter(tags, stars);
  }

  /**
   * @param tags
   */
  public static fromTags(
    tags: string[]
  ) {
    return new ToolGenericFilter(tags, 0);
  }

  public toPrimitives() {
    return Object.assign({
      tags: this.tags,
      stars: this.stars
    }, ...this.toPrimitives());
  }

  public getTags(): Array<string> {
    return this.tags;
  }

  public getStars(): number {
    return Number(this.stars);
  }
  
}