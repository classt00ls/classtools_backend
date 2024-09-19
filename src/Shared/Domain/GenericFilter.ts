
export class GenericFilter {
  
    constructor (
      private page: number,
      private pageSize: number,
      private orderBy?: string
    ) {}

    public toPrimitives() {
      return {
        page: this.page,
        pageSize: this.pageSize,
        orderBy: this.orderBy
      };
    }

    public getPage(): number {
      return (Number(this.page) - 1)*Number(this.pageSize)
    }

    public getPageSize(): number {
      return this.pageSize;
    }

    public getOrderBy(): string|null {
      return this.orderBy;
    }
    
  }