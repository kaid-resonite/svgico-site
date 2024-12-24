import { FormActionResponse } from './types';

class FormActionRequestPayloadError extends Error {}
export const parseFormData = async <T>(formData: FormData): Promise<T> => {
    const data = formData.get('payload');
    if (typeof data !== 'string') {
        throw new FormActionRequestPayloadError(
            'Form data payload is not a string',
        );
    }
    try {
        return JSON.parse(data);
    } catch (error) {
        console.error(error);
        throw new FormActionRequestPayloadError(
            'Form data payload is not a valid JSON string',
        );
    }
};

export const createFormAction = <T = undefined, U = T>(
    function_: (data: T) => Promise<FormActionResponse<U>>,
): ((formData: FormData) => Promise<FormActionResponse<U>>) => {
    return async (formData: FormData) => {
        'use server';
        const data = await parseFormData<T>(formData);
        const response = await function_(data);
        return response;
    };
};
