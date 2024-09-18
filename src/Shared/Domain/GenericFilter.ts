import { IsNumber, IsOptional } from "class-validator";


export class GenericFilter {
  
    constructor (
      public page: number,
      public pageSize: number,
      public orderBy?: string
    ) {}
    
  }