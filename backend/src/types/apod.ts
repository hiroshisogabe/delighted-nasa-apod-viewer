export interface ApodImageResult {
  title: string;
  date: string;
  explanation: string;
  imageUrl: string;
  copyright?: string;
}

export type ApodErrorCode = 'RATE_LIMIT_REACHED' | 'TRY_AGAIN';

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

export interface NasaApodPayload {
  title: string;
  date: string;
  explanation: string;
  media_type: string;
  url?: string;
  copyright?: string;
}
