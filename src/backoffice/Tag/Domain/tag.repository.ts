import { Injectable } from "@nestjs/common";
import { TagModel } from "@Backoffice/Tag/Domain/Tag.model";
import { InsertResult, UpdateResult } from "typeorm";

@Injectable()
export abstract class TagRepository {

  abstract save(model: TagModel): Promise<TagModel>;
  abstract create(model: Partial<TagModel>): Promise<TagModel>;
  abstract insert(model: TagModel): Promise<InsertResult>;
  abstract update(model: TagModel): Promise<UpdateResult>;
  abstract getAll(): Promise<TagModel[]>;
  abstract getAllCategories(): Promise<TagModel[]>;
  abstract getOneByIdOrFail(id: string): Promise<TagModel>;
  abstract getOneByNameAndFail(name: string): Promise<void>;
  abstract getOneByNameOrFail(name: string): Promise<TagModel>;
}
