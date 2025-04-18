import { UserWeb } from "@Web/UserWeb/Domain/UserWeb";
import { UserWebExtractor } from "@Web/UserWeb/Domain/UserWebExtractor";
import { UserWebExtractorFromFirebase } from "./UserWebExtractorFromFirebase";
import { UserWebExtractorFromJwt } from "./UserWebExtractorFromJwt";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserWebExtractorFromFirebaseOrJwt extends UserWebExtractor {

    constructor(
        private extractFromFirebase: UserWebExtractorFromFirebase,
        private extractFromJwt: UserWebExtractorFromJwt
    ) {
        super();
      }

    public async execute(token: string): Promise<UserWeb> {

        let userWeb;

        try {

            userWeb = await this.extractFromFirebase.execute(token);
           
        } catch (error) {

            userWeb = await this.extractFromJwt.execute(token);
        }

        return userWeb;
    }
    
}