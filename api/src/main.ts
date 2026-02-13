import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  const fastify = app.getHttpAdapter().getInstance();

  // Fix: VSCode REST Client a volte manda "content-type: undefined"
  fastify.addHook('onRequest', (request: any, _reply: any, done: any) => {
    if (request.headers['content-type'] === 'undefined') {
      delete request.headers['content-type'];
    }
    done();
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
