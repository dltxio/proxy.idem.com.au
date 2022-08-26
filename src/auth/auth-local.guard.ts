import { AuthGuard } from "@nestjs/passport";
import { Injectable, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "./anonymous";

@Injectable()
export class LocalGuard extends AuthGuard("basic") {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()]
        );
        if (isPublic) {
            return true;
        }
        return super.canActivate(context);
    }
}
