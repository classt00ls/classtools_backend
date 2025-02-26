import { UserWeb } from "@Web/UserWeb/Domain/UserWeb";
import { UserWebExtractor } from "@Web/Domain/Service/UserWeb/UserWebExtractor";
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
            console.log('Tenemos user de firebase')
           
        } catch (error) {

            userWeb = await this.extractFromJwt.execute(token);
            console.log('Tenemos user de jwt')
        }

        return userWeb;
    }
    
}