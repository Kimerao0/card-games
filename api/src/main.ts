import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io'; // NEW: adapter ufficiale Nest per Socket.IO
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Fix: VSCode REST Client a volte manda "content-type: undefined"
  app.use((req: any, _res: any, next: any) => {
    if (req.headers['content-type'] === 'undefined') {
      delete req.headers['content-type'];
    }
    next();
  });

  app.enableCors({
    origin: ['http://localhost:5173', 'http://192.168.1.96:5173'],
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // NEW: abilita Socket.IO sullo stesso server/porta dell’HTTP.
  //
  // Perché serve:
  // - Senza questa riga Nest non "attacca" l'infrastruttura WebSocket al runtime dell'app,
  //   quindi i @WebSocketGateway non riceverebbero connessioni.
  // - Con IoAdapter (socket.io) possiamo usare le rooms e la semantica socket.io nel gateway
  //   (join/leave, server.to(room).emit(...), handshake auth, ecc.).
  //
  // Cosa otteniamo:
  // - Il client potrà connettersi a: io('http://localhost:3000', { auth: { token } })
  // - REST e WebSocket condividono la stessa porta (3000) e lo stesso processo Node.
  //
  // Nota importante:
  // - Il CORS di socket.io NON è quello di app.enableCors(): viene gestito separatamente
  //   tramite l'opzione { cors: ... } del @WebSocketGateway.
  // - Quindi qui non serve duplicare configurazioni cors per il canale WS.

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
