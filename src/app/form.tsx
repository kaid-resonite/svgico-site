'use client';

import { useState } from 'react';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormAction } from '@/libs/form/types';
import { useFormAction } from '@/libs/form/use-form-action';

export const Form = ({
    convertAction,
}: {
    convertAction: FormAction<Blob>;
}) => {
    const { action, submit, isPending } = useFormAction(convertAction);
    const [file, setFile] = useState<File | undefined>();
    const download = (data: Blob) => {
        try {
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'favicon.ico';
            document.body.append(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch {
            toast.error('Error downloading file');
        }
    };
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!file) {
            return;
        }
        const formData = new FormData();
        formData.set('file', file);
        submit(formData, {
            onSuccess: download,
            onError: (error) => {
                toast.error(error.message);
            },
        });
    };
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.item(0);
        setFile(file ?? undefined);
    };
    return (
        <form
            className="grid w-full max-w-sm items-center gap-1.5"
            onSubmit={handleSubmit}
            action={action}
        >
            <Input
                name="file"
                type="file"
                accept="image/svg+xml"
                onChange={handleFileChange}
            />
            <Button type="submit" disabled={isPending}>
                {isPending ? 'Converting...' : 'Convert'}
            </Button>
        </form>
    );
};
