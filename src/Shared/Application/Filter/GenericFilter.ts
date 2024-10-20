
export class GenericFilter {
  
  /**
   * 
   * @param page La página inicial que será cargada
   * @param pageSize El número de elementos que serán cargados en cada página
   * @param orderBy El campo por el que ordenaremos los resultados
   */
  constructor (
    protected page: number,
    protected pageSize: number,
    protected orderBy?: string
  ) {
  }

  protected toPrimitives() {
    return {
      page: this.page,
      pageSize: this.pageSize,
      orderBy: this.orderBy
    };
  }

  public getPage(): number {
    return (Number(this.page) - 1)*Number(this.pageSize);
  }

  public getPageSize(): number {
    return this.pageSize;
  }

  public getOrderBy(): string|null {
    return this.orderBy;
  }
  
}