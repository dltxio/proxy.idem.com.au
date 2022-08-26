import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { GenericInterceptor } from "./utils/interceptors";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import tracer from "dd-trace";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
    tracer.init();
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: true
    });
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true
        })
    );
    app.useGlobalInterceptors(new GenericInterceptor());

    const options = new DocumentBuilder()
        .setTitle("Idem Proxy API")
        .setDescription("Proxy requests to exchanges")
        .setVersion("1.0")
        .addBasicAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup("swagger", app, document);

    await app.listen(3000);
}
bootstrap();
