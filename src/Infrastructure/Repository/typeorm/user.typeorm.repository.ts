import { Injectable } from "@nestjs/common";

import { DataSource, InsertResult, Repository } from 'typeorm';
import { UserSchema } from "src/Shared/Infrastructure/Persistence/typeorm/user.schema";
import { UserRepository } from "src/Shared/Domain/Repository/user.repository";
import { UserModel } from "src/Shared/Domain/Model/User/user.model";

@Injectable()
export class UserTypeormRepository extends UserRepository {
  
  private repository : Repository<UserModel>;

  constructor(datasource: DataSource) {
    super();
    this.repository = datasource.getRepository(UserSchema);
  }
  
  async getAll(): Promise<UserModel[]> {
    return this.repository.find();
  }

  async create(
    model: UserModel
  ): Promise<UserModel> {
    return await this.repository.create(model);
  }

  async insert(
    model: UserModel
  ): Promise<InsertResult> {
    return await this.repository.insert(model);
  }

  async save(model: UserModel): Promise<UserModel> {
    return this.repository.save(model);
  }

  async getOneByIdOrFail(
    id: string
  ): Promise<UserModel> {
    const response = await this.repository.findOneByOrFail({id});
    return response;
  }

  /**
     * @description
     * -------------------------------------------------
     * @param email 
     * @throws {Error}
     */
  public async findOneByEmailAndFail(email: string): Promise<void>
  {
      const existingUser = await this.repository.createQueryBuilder("user")
          .where("user.email = :email", {email})
          .getOne();
      if(existingUser) throw new Error('');
  }

}
