export interface ApodImageResult {
  title: string;
  date: string;
  explanation: string;
  imageUrl: string;
  copyright?: string;
}

export type ApodErrorCode = 'RATE_LIMIT_REACHED' | 'TRY_AGAIN';

export interface ApodErrorResponse {
  errorCode: ApodErrorCode;
  message: string;
}

export interface ApodIdleState {
  status: 'idle';
  data: null;
  error: null;
}

export interface ApodLoadingState {
  status: 'loading';
  data: null;
  error: null;
}

export interface ApodSuccessState {
  status: 'success';
  data: ApodImageResult;
  error: null;
}

export interface ApodErrorState {
  status: 'error';
  data: null;
  error: ApodErrorResponse;
}

export type ApodUiState = ApodIdleState | ApodLoadingState | ApodSuccessState | ApodErrorState;

export type ApodRequestResult =
  | { type: 'success'; data: ApodImageResult }
  | { type: 'error'; error: ApodErrorResponse };

export const createApodErrorMessage = (errorCode: ApodErrorCode): string => {
  if (errorCode === 'RATE_LIMIT_REACHED') {
    return 'The rate limit was reached';
  }

  return 'Try again';
};

export const createApodErrorResponse = (errorCode: ApodErrorCode): ApodErrorResponse => {
  return {
    errorCode,
    message: createApodErrorMessage(errorCode)
  };
};

export const createIdleApodState = (): ApodIdleState => {
  return {
    status: 'idle',
    data: null,
    error: null
  };
};

export const createLoadingApodState = (): ApodLoadingState => {
  return {
    status: 'loading',
    data: null,
    error: null
  };
};

export const createSuccessApodState = (data: ApodImageResult): ApodSuccessState => {
  return {
    status: 'success',
    data,
    error: null
  };
};

export const createErrorApodState = (error: ApodErrorResponse): ApodErrorState => {
  return {
    status: 'error',
    data: null,
    error
  };
};
