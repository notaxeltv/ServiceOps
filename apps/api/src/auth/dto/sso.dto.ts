import { IsBoolean, IsEnum, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
import { SsoProvider } from '@prisma/client';

export class UpdateSsoConfigDto {
  @IsEnum(SsoProvider)
  provider!: SsoProvider;

  @IsBoolean()
  enabled!: boolean;

  @IsString()
  @MinLength(3)
  issuer!: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientSecret?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  metadataUrl?: string;

  @IsOptional()
  @IsString()
  idpCert?: string;

  @IsOptional()
  @IsString()
  emailAttribute?: string;
}
