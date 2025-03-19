import { Injectable } from "@nestjs/common";
import { InsertResult } from "typeorm";
import { GenericFilter } from "src/Shared/Application/Filter/GenericFilter";
import { ToolModel } from "@Backoffice/Tool/Domain/tool.model";

@Injectable()
export abstract class ToolRepository {
  constructor(protected readonly suffix: string = '') {}

  abstract save(model: ToolModel): Promise<ToolModel>;
  abstract create(model: Partial<ToolModel>): Promise<ToolModel>;
  abstract insert(model: ToolModel): Promise<InsertResult>;
  abstract getAll(filter: GenericFilter): Promise<ToolModel[]>;
  abstract getAll(filter: GenericFilter): Promise<ToolModel[]>;
  abstract count(tags: Array<string>): Promise<number>; // ,stars: number, title: string
  abstract getOneByNameAndFail(name: string): Promise<void>;
  abstract getOne(id: string): Promise<ToolModel>;
  abstract getOneByNameOrFail(name: string): Promise<ToolModel>;
  abstract getOneByLinkAndFail(name: string): Promise<void>;
  abstract getOneByLinkOrFail(name: string): Promise<ToolModel>;
  abstract getOneByIdOrFail(id: string): Promise<ToolModel>;
  abstract getOneBySlugOrFail(slug: string): Promise<ToolModel>;
  abstract export(): Promise<void>;
  abstract findByTagId(tagId: string): Promise<ToolModel[]>;
}
