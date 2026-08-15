export interface ApiErrorBody {
  error: string;
  message: string;
  details?: unknown;
  timestamp?: string;
  path?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.error;
    this.details = body.details;
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    let body: ApiErrorBody;
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      body = { error: 'UNKNOWN', message: res.statusText || 'Request failed' };
    }

    return new ApiError(res.status, body);
  }
}

export const NETWORK_ERROR_MESSAGE = 'No se pudo conectar con el servidor';
