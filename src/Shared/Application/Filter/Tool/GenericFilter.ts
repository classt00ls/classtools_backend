
export class GenericFilter {
  
  constructor (
    private page: number,
    private pageSize: number,
    private orderBy?: string,
    private tags: string[] = [],
    private stars: number = 0
  ) {
  }

  public toPrimitives() {
    return {
      page: this.page,
      pageSize: this.pageSize,
      orderBy: this.orderBy,
      tags: this.tags,
      stars: this.stars
    };
  }

  public getPage(): number {
    return (Number(this.page) - 1)*Number(this.pageSize);
  }

  public getTags(): Array<string> {
    return this.tags;
  }

  public getStars(): number {
    return Number(this.stars);
  }

  public getPageSize(): number {
    return this.pageSize;
  }

  public getOrderBy(): string|null {
    return this.orderBy;
  }
  
}