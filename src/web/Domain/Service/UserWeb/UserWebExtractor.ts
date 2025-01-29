import { UserWeb } from "@Web/Domain/Model/UserWeb/UserWeb";


export abstract class UserWebExtractor {

    abstract execute(token: string): Promise<UserWeb> ;

}