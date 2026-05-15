import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { AppModule } from '../app.module';

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Fullstack Dojo API')
    .setDescription('Order Management API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const outputPath = resolve(__dirname, '../../openapi.json');

  writeFileSync(outputPath, JSON.stringify(document, null, 2));
  console.log(`OpenAPI spec written to ${outputPath}`);

  await app.close();
}

generate();
