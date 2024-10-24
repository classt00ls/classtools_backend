import { Injectable } from "@nestjs/common";
import { InsertResult } from "typeorm";
import { CompanyModel } from "../Model/company.model";

@Injectable()
export abstract class CompanyRepository {

  abstract save(model: CompanyModel): Promise<CompanyModel>;
  abstract create(model: Partial<CompanyModel>): Promise<CompanyModel>;
  abstract insert(model: CompanyModel): Promise<InsertResult>;
  abstract getAll(): Promise<CompanyModel[]>;
  abstract getOneByIdOrFail(id: string): Promise<CompanyModel>;
  abstract findOneByNameAndFail(email: string): Promise<void>;
}
