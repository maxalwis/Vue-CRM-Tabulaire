import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ColumnsModule } from './columns/columns.module';
import { ContactsModule } from './contacts/contacts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 5432)),
        username: config.get<string>('DB_USER', 'crm'),
        password: config.get<string>('DB_PASSWORD', 'crm'),
        database: config.get<string>('DB_NAME', 'crm'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: true,
        synchronize: false,
		}),
	}),
	ColumnsModule,
	ContactsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
