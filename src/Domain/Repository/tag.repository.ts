import { Injectable } from "@nestjs/common";
import { InsertResult } from "typeorm";
import { TagModel } from "../Model/tag.model";

@Injectable()
export abstract class TagRepository {

  abstract save(model: TagModel): Promise<TagModel>;
  abstract create(model: Partial<TagModel>): Promise<TagModel>;
  abstract insert(model: TagModel): Promise<InsertResult>;
  abstract getAll(): Promise<TagModel[]>;
  abstract getOneByIdOrFail(id: string): Promise<TagModel>;
}
