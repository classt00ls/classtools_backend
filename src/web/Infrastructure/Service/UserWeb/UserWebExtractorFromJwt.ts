import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "@Shared/Infrastructure/jwt/constants";
import { UserWeb } from "@Web/Domain/Model/UserWeb/UserWeb";

@Injectable()
export class UserWebExtractorFromJwt {

    constructor(
        private jwtService: JwtService
    ) {
      }

    public async execute(token: string): Promise<UserWeb> {

        // Si el token de firebase no se decodifica comprobar si lo hace el jwt
        const payload = await this.jwtService.verifyAsync(
              token,
              {
              secret: jwtConstants.secret
              }
        );
        const uid = payload.uid;
        const email = payload.email ;
        

        return UserWeb.create(
            uid,
            email,
            ''
        );
    }
    
}