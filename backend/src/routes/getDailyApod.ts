import { Request, Response } from 'express';
import { classifyNasaFailure } from '../services/classifyNasaFailure';
import { fetchDailyApodFromNasa } from '../services/fetchApodFromNasa';
import { mapDailyApodImageResponse } from '../services/mapApodImageResponse';
import { ApodErrorCode } from '../types/apod';

const SUCCESS_STATUS = 200;
const UPSTREAM_FAILURE_STATUS = 502;

const createFailureMessage = (errorCode: ApodErrorCode): string => {
  if (errorCode === 'RATE_LIMIT_REACHED') {
    return 'The rate limit was reached';
  }

  return 'Try again';
};

const createErrorResponse = (errorCode: ApodErrorCode): { errorCode: ApodErrorCode; message: string } => {
  return {
    errorCode,
    message: createFailureMessage(errorCode)
  };
};

const readNasaApiKey = (): string => {
  return process.env.NASA_API_KEY ?? '';
};

export const getDailyApod = async (_req: Request, res: Response): Promise<void> => {
  try {
    const nasaPayload = await fetchDailyApodFromNasa({
      apiKey: readNasaApiKey()
    });
    const mappedPayload = mapDailyApodImageResponse(nasaPayload);

    res.status(SUCCESS_STATUS).json(mappedPayload);
    return;
  } catch (error: unknown) {
    const errorCode = classifyNasaFailure(error);

    res.status(UPSTREAM_FAILURE_STATUS).json(createErrorResponse(errorCode));
  }
};
