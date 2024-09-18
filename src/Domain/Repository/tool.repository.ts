import { Injectable } from "@nestjs/common";
import { InsertResult } from "typeorm";
import { ToolModel } from "../Model/tool.model";
import { GenericFilter } from "src/Shared/Domain/GenericFilter";

@Injectable()
export abstract class ToolRepository {

  abstract save(model: ToolModel): Promise<ToolModel>;
  abstract create(model: Partial<ToolModel>): Promise<ToolModel>;
  abstract insert(model: ToolModel): Promise<InsertResult>;
  abstract getAll(filter: GenericFilter): Promise<ToolModel[]>;
  abstract getOneByIdOrFail(id: string): Promise<ToolModel>;
  abstract getOneByNameAndFail(id: string): Promise<void>;
  abstract getOneByNameOrFail(name: string): Promise<ToolModel>;
  abstract getOneByLinkAndFail(name: string): Promise<void>;
}
