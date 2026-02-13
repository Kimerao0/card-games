import { ConfigService } from '@nestjs/config';
import { ConfigType } from 'src/config/config.types';

export class TypedConfigService extends ConfigService<ConfigType> {}
