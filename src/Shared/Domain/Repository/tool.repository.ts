import { Injectable } from "@nestjs/common";
import { InsertResult } from "typeorm";
import { GenericFilter } from "src/Shared/Application/Filter/GenericFilter";
import { ToolModel } from "../Model/Tool/tool.model";

@Injectable()
export abstract class ToolRepository {

  abstract save(model: ToolModel): Promise<ToolModel>;
  abstract create(model: Partial<ToolModel>): Promise<ToolModel>;
  abstract insert(model: ToolModel): Promise<InsertResult>;
  abstract getAll(filter: GenericFilter): Promise<ToolModel[]>;
  abstract getAll(filter: GenericFilter): Promise<ToolModel[]>;
  abstract count(tags: Array<string>,stars: number, title: string): Promise<number>;
  abstract getOneByNameAndFail(name: string): Promise<void>;
  abstract getOneByNameOrFail(name: string): Promise<ToolModel>;
  abstract getOneByLinkAndFail(name: string): Promise<void>;
  abstract getOneByLinkOrFail(name: string): Promise<ToolModel>;
  abstract getOneByIdOrFail(id: string): Promise<ToolModel>;
}
