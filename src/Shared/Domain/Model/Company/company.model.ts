import { BaseModel } from "../Shared/base.model";
import { UserModel } from "./user.model";


export class CompanyModel extends BaseModel {
  
  email?: string;
  
  // Será la reference asignada para el metadata de nuestro token
  name: string;

	cif?: string;

	street?: string;
  
	city?: string;

	cp?: string;

  country?: string;

  monthlySubscriptionStatus?: string;

  // La url del archivo GLB en s3
  phone?: string;

  // El estado del producto changing | pending | published AND more??
  deleted?: boolean;

  users?: UserModel[];

}