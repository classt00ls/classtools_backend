import { Injectable } from "@nestjs/common";

import { DataSource, InsertResult, Repository } from 'typeorm';
import { CompanyModel } from "src/Domain/Model/company.model";
import { CompanyRepository } from "src/Domain/Repository/company.repository";
import { CompanySchema } from "src/Shared/Infrastructure/Persistence/typeorm/company.schema";

@Injectable()
export class CompanyTypeormRepository extends CompanyRepository {
  
  private repository : Repository<CompanyModel>;

  constructor(datasource: DataSource) {
    super();
    this.repository = datasource.getRepository(CompanySchema);
  }
  
  async getAll(): Promise<CompanyModel[]> {
    return this.repository.find();
  }

  async create(
    model: CompanyModel
  ): Promise<CompanyModel> {
    return await this.repository.create(model);
  }

  async insert(
    model: CompanyModel
  ): Promise<InsertResult> {
    return await this.repository.insert(model);
  }

  async save(model: CompanyModel): Promise<CompanyModel> {
    return this.repository.save(model);
  }

  async getOneByIdOrFail(
    id: string
  ): Promise<CompanyModel> {
    const response = await this.repository.findOneByOrFail({id});
    return response;
  }

  /**
     * @description
     * -------------------------------------------------
     * @param name 
     * @throws {Error}
     */
  public async findOneByNameAndFail(name: string): Promise<void>
  {
      const existingUser = await this.repository.createQueryBuilder("company")
          .where("company.name = :name", {name})
          .getOne();
      if(existingUser) throw new Error('');
  }

}
