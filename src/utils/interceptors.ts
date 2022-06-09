import {
    CallHandler,
    ExecutionContext,
    HttpStatus,
    Injectable,
    NestInterceptor,
    NotFoundException,
    HttpException,
    Logger
} from "@nestjs/common";
import {
    EntityNotFoundError,
    EntityCannotCreateError,
    EntityCannotUpdateError,
    EntityMissingIdError
} from "../interfaces";
import { catchError, Observable } from "rxjs";

@Injectable()
export class GenericInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler
    ): Observable<unknown> {
        // next.handle() is an Observable of the controller's result value
        return next.handle().pipe(
            catchError(err => {
                Logger.error(err.message);
                Logger.verbose(`Error caught in ${context.getHandler().name}`);
                if (err instanceof EntityNotFoundError) {
                    throw new NotFoundException(err.message);
                } else if (err instanceof EntityCannotUpdateError) {
                    throw new HttpException(err.message, HttpStatus.FORBIDDEN);
                } else if (err instanceof EntityMissingIdError) {
                    throw new HttpException(
                        err.message,
                        HttpStatus.BAD_REQUEST
                    );
                } else if (err instanceof EntityCannotCreateError) {
                    throw new HttpException(
                        err.message,
                        HttpStatus.BAD_REQUEST
                    );
                } else if (err.message.toLowerCase().includes("bad request")) {
                    throw err;
                } else {
                    throw new HttpException(err.message, 500);
                }
            })
        );
    }
}
