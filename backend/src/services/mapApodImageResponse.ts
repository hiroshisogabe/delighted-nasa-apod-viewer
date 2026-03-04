import { ApodImageResult } from '../types/apod';

const IMAGE_MEDIA_TYPE = 'image';

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

const mapPayloadToImageResult = (payload: JsonRecord): ApodImageResult => {
  const mediaType = readStringField(payload, 'media_type');

  if (mediaType !== IMAGE_MEDIA_TYPE) {
    throw new Error('NASA APOD payload is not an image');
  }

  const mappedResult: ApodImageResult = {
    title: readStringField(payload, 'title'),
    date: readStringField(payload, 'date'),
    explanation: readStringField(payload, 'explanation'),
    imageUrl: readStringField(payload, 'url')
  };
  const copyrightValue = payload.copyright;

  if (typeof copyrightValue === 'string' && copyrightValue.trim().length > 0) {
    mappedResult.copyright = copyrightValue;
  }

  return mappedResult;
};

export const mapDailyApodImageResponse = (payload: unknown): ApodImageResult => {
  if (isRecord(payload)) {
    return mapPayloadToImageResult(payload);
  }

  throw new Error('NASA APOD daily payload is invalid');
};

export const mapRandomApodImageResponse = (payload: unknown): ApodImageResult => {
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error('NASA APOD random payload is invalid');
  }

  const firstPayload = payload[0];

  if (isRecord(firstPayload)) {
    return mapPayloadToImageResult(firstPayload);
  }

  throw new Error('NASA APOD random payload is invalid');
};
