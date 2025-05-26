import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthGuard } from './Shared/Infrastructure/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // const whitelist = ['http://localghost:3001', 'https://leads.adspotmedia.com', 'https://leads.adspotmedia.com/node'];

  const options = {
    origin: function (origin, callback) {
      //if (whitelist.indexOf(origin) !== -1) {
        //console.log("allowed cors for:", origin)
        callback(null, true)
        /*
      } else {
        console.log("blocked cors for:", origin)
        callback(new Error('Not allowed by CORS'))
      }
      */
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true
  };

  app.enableCors(options);
  // app.useGlobalGuards(new AuthGuard(new JwtService(), new Reflector()));

  await app.listen(process.env.PORT || 3000);

  console.log(`Server is running on port ${process.env.PORT || 3000}`);

}
bootstrap();
