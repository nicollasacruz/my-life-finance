import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Allows usage in GraphQL/HTTP if needed
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
