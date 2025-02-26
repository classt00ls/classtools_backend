import { UserWeb } from "@Web/UserWeb/Domain/UserWeb";


export abstract class UserWebExtractor {

    abstract execute(token: string): Promise<UserWeb> ;

}