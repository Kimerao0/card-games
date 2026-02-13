import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  // Fix: some clients (es. VSCode REST Client) may send "content-type: undefined"
  // on requests without body (DELETE/POST). Accept it as empty body.
  app
    .getHttpAdapter()
    .getInstance()
    .addContentTypeParser(/^undefined$/, { parseAs: 'string' }, (_req, _body, done) => {
      done(null, undefined);
    });

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
