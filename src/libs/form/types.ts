export type FormActionError = {
    code: string;
    message: string;
    details?: unknown;
};

export type FormActionErrorResponse = {
    error: FormActionError;
};

export type FormActionSuccessResponse<T> = {
    data: T;
};

export type FormActionResponse<T> =
    | FormActionSuccessResponse<T>
    | FormActionErrorResponse;

export type FormActionSuccessOptions<T> = {
    data: T;
    status: number;
};

export type FormActionErrorResponseOptions = {
    error: FormActionError;
    status: number;
};

export type FormActionResponseOptions<T> =
    | FormActionSuccessOptions<T>
    | FormActionErrorResponseOptions;

export type FormAction<T = undefined, U = T> = (
    formData: FormData,
) => Promise<FormActionResponse<T>>;
