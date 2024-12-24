'use client';

import {
    useActionState,
    useEffect,
    useRef,
    useState,
    useTransition,
} from 'react';

import { FormAction, FormActionError, FormActionResponse } from './types';

type FormActionOptions<U> = {
    onError?: (error: FormActionError) => void;
    onSuccess?: (data: U) => void;
};
export const useFormAction = <T, U = T>(function_: FormAction<T, U>) => {
    const [response, dispatch] = useActionState<
        FormActionResponse<U>,
        FormData
    >(
        async (_, formData) =>
            (await function_(formData)) as FormActionResponse<U>,
        {} as FormActionResponse<U>,
    );
    const [isPending, startTransition] = useTransition();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const onSubmitReference = useRef<FormActionOptions<U>['onSuccess']>();
    const onErrorReference = useRef<FormActionOptions<U>['onError']>();

    useEffect(() => {
        if (!response) {
            return;
        }
        if ('error' in response) {
            onErrorReference.current?.(response.error);
            onErrorReference.current = undefined;
            setIsSubmitting(false);
        }
        if ('data' in response) {
            onSubmitReference.current?.(response.data);
            onSubmitReference.current = undefined;
            setIsSubmitting(false);
        }
    }, [response]);

    const submit = (formData: FormData, options?: FormActionOptions<U>) => {
        if (options?.onSuccess) {
            onSubmitReference.current = options.onSuccess;
        }
        if (options?.onError) {
            onErrorReference.current = options.onError;
        }
        setIsSubmitting(true);
        startTransition(() => {
            dispatch(formData);
        });
    };

    return {
        action: dispatch,
        submit,
        isPending: isSubmitting || isPending,
    };
};
