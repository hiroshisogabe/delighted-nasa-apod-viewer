export type ApodMediaType = 'image' | 'video';

export interface ApodMediaResult {
  title: string;
  date: string;
  explanation: string;
  mediaType: ApodMediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  copyright?: string;
}

export type ApodErrorCode = 'RATE_LIMIT_REACHED' | 'TRY_AGAIN' | 'MEDIA_TYPE_UNSUPPORTED';

export type NasaErrorSource = 'NASA' | 'INTERNAL';

export interface NasaApiRequestErrorContext {
  source: NasaErrorSource;
  statusCode?: number;
}

export class NasaApiRequestError extends Error {
  public readonly source: NasaErrorSource;
  public readonly statusCode?: number;

  public constructor(message: string, context: NasaApiRequestErrorContext) {
    super(message);

    this.name = 'NasaApiRequestError';
    this.source = context.source;
    this.statusCode = context.statusCode;
  }
}

export class NasaApodUnsupportedMediaError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'NasaApodUnsupportedMediaError';
  }
}

export interface NasaApodPayload {
  title: string;
  date: string;
  explanation: string;
  media_type: string;
  url?: string;
  thumbnail_url?: string;
  copyright?: string;
}
