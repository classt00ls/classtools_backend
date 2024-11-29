import { SignupUserEvent } from "../../Event/User/SignupUserEvent";
import { BaseModel } from "../base.model";
import { CompanyModel } from "../Company/company.model";


export type UserRoles = 'user' | 'editor' | 'admin' | 'superadmin';

export class UserModel extends BaseModel {
  
  private constructor(
    id: string,
    email: string,
    password: string,
    role: UserRoles,
    confirmed: boolean,
    name?: string,
    surname?: string
  ) {

    super( );
    this.id = id;
    this.email = email;
    
    this.password = password;

    this.name = name ?? null;
    this.surname = surname ?? null;

    this.confirmed = confirmed;
    this.role = role;
  }

  public static crear = (
    id: string,
    email: string,
    password: string,
    nombre?: string
  ) => {
    const nuevo_usuario = new UserModel(
      id,
      email,
      password,
      'user',
      false,
      nombre
    );

    nuevo_usuario.record(
      new SignupUserEvent(
        id,
        email,
        nombre
      )
    );

    return nuevo_usuario;

  }
  

  
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