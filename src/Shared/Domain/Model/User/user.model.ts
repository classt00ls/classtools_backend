import { BaseModel } from "../base.model";
import { CompanyModel } from "../Company/company.model";


export type UserRoles = 'user' | 'editor' | 'admin' | 'superadmin';

export class UserModel extends BaseModel {

  id: string;

  email: string;

  password: string;
  
  // Será la reference asignada para el metadata de nuestro token
  name: string;

  // La url del archivo STL en s3
  surname: string;

  // La url del archivo GLB en s3
  phone: string|null;

  // La url de la imagen en s3
  confirmed: boolean;

  // El estado del producto changing | pending | published AND more??
  deleted: boolean

  role: UserRoles;

  company: CompanyModel|null
}