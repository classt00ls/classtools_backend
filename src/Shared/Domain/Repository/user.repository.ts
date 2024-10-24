import { Injectable } from "@nestjs/common";
import { UserModel } from "../Model/user.model";
import { InsertResult } from "typeorm";

@Injectable()
export abstract class UserRepository {

  abstract save(model: UserModel): Promise<UserModel>;
  abstract create(model: Partial<UserModel>): Promise<UserModel>;
  abstract insert(model: UserModel): Promise<InsertResult>;
  abstract getAll(): Promise<UserModel[]>;
  abstract getOneByIdOrFail(id: string): Promise<UserModel>;
  abstract findOneByEmailAndFail(email: string): Promise<void>;
}
