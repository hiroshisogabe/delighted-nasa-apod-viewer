import { ApodMediaResult, NasaApodUnsupportedMediaError } from '../types/apod';

const IMAGE_MEDIA_TYPE = 'image';
const VIDEO_MEDIA_TYPE = 'video';
const DIRECT_PLAYABLE_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.ogv', '.m4v'];

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const readStringField = (payload: JsonRecord, fieldName: string): string => {
  const fieldValue = payload[fieldName];

  if (typeof fieldValue === 'string' && fieldValue.trim().length > 0) {
    return fieldValue;
  }

  throw new Error(`NASA APOD payload is missing ${fieldName}`);
};

const readOptionalStringField = (payload: JsonRecord, fieldName: string): string | undefined => {
  const fieldValue = payload[fieldName];

  if (typeof fieldValue === 'string' && fieldValue.trim().length > 0) {
    return fieldValue;
  }

  return undefined;
};

const isDirectPlayableVideoUrl = (mediaUrl: string): boolean => {
  try {
    const parsedUrl = new URL(mediaUrl);
    const normalizedPath = parsedUrl.pathname.toLowerCase();

    return DIRECT_PLAYABLE_VIDEO_EXTENSIONS.some((extension) => normalizedPath.endsWith(extension));
  } catch (_error: unknown) {
    return false;
  }
};

const mapImagePayloadToMediaResult = (payload: JsonRecord): ApodMediaResult => {
  return {
    title: readStringField(payload, 'title'),
    date: readStringField(payload, 'date'),
    explanation: readStringField(payload, 'explanation'),
    mediaType: IMAGE_MEDIA_TYPE,
    mediaUrl: readStringField(payload, 'url'),
    copyright: readOptionalStringField(payload, 'copyright')
  };
};

const mapVideoPayloadToMediaResult = (payload: JsonRecord): ApodMediaResult => {
  const mediaUrl = readStringField(payload, 'url');

  if (!isDirectPlayableVideoUrl(mediaUrl)) {
    throw new NasaApodUnsupportedMediaError('NASA APOD payload video URL is not directly playable');
  }

  return {
    title: readStringField(payload, 'title'),
    date: readStringField(payload, 'date'),
    explanation: readStringField(payload, 'explanation'),
    mediaType: VIDEO_MEDIA_TYPE,
    mediaUrl,
    thumbnailUrl: readOptionalStringField(payload, 'thumbnail_url'),
    copyright: readOptionalStringField(payload, 'copyright')
  };
};

const mapPayloadToMediaResult = (payload: JsonRecord): ApodMediaResult => {
  const mediaType = readStringField(payload, 'media_type');

  if (mediaType === IMAGE_MEDIA_TYPE) {
    return mapImagePayloadToMediaResult(payload);
  }

  if (mediaType === VIDEO_MEDIA_TYPE) {
    return mapVideoPayloadToMediaResult(payload);
  }

  throw new NasaApodUnsupportedMediaError('NASA APOD payload media type is unsupported');
};

export const mapDailyApodMediaResponse = (payload: unknown): ApodMediaResult => {
  if (isRecord(payload)) {
    return mapPayloadToMediaResult(payload);
  }

  throw new Error('NASA APOD daily payload is invalid');
};

export const mapRandomApodMediaResponse = (payload: unknown): ApodMediaResult => {
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error('NASA APOD random payload is invalid');
  }

  const firstPayload = payload[0];

  if (isRecord(firstPayload)) {
    return mapPayloadToMediaResult(firstPayload);
  }

  throw new Error('NASA APOD random payload is invalid');
};
