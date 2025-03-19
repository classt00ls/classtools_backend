import { Routes } from "@nestjs/core";
import { WebAuthModule } from "./auth/web-auth.module";

export const webRoutes: Routes = [ 
    {
      path: '/web/auth',
      module: WebAuthModule,
    },
  ];