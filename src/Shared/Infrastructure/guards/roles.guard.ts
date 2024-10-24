import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// import { AppRoles } from 'src/Domain/data/Roles'; 
// import { ROLES_KEY } from '../decorators/user/roles-decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // const requiredRoles = this.reflector.getAllAndOverride<AppRoles[]>(ROLES_KEY, [
    //   context.getHandler(),
    //   context.getClass(),
    // ]);
    // if (!requiredRoles) {
    //   return true;
    // }
    // const { currentUser } = context.switchToHttp().getRequest();
    // return currentUser && (requiredRoles.some((role) => currentUser.role == role));

    return true;
  }
}