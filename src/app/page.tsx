import { Metadata } from 'next';

import sharp from 'sharp';

import { FormAction } from '@/libs/form/types';

import { Form } from './form';

const ICON_SIZES = [16, 32, 48, 64, 128, 256];

const convertSvgtoIco = async (file: Blob) => {
    const svgBuffer = await file.arrayBuffer();
    const pngBuffers = await Promise.all(
        ICON_SIZES.map(async (size) => {
            const buffer = await sharp(svgBuffer)
                .resize(size, size)
                .png()
                .toBuffer();
            return { size, buffer };
        }),
    );

    const headerSize = 6 + 16 * pngBuffers.length;
    let offset = headerSize;

    const header = Buffer.alloc(headerSize);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(pngBuffers.length, 4);

    const imageBuffers = [];
    for (const [index, { size, buffer }] of pngBuffers.entries()) {
        const width = size >= 256 ? 0 : size;
        const height = size >= 256 ? 0 : size;

        header.writeUInt8(width, 6 + index * 16);
        header.writeUInt8(height, 7 + index * 16);
        header.writeUInt8(0, 8 + index * 16); // Color palette
        header.writeUInt8(0, 9 + index * 16); // Reserved
        header.writeUInt16LE(1, 10 + index * 16); // Color planes
        header.writeUInt16LE(32, 12 + index * 16); // Bits per pixel
        header.writeUInt32LE(buffer.length, 14 + index * 16); // Image size
        header.writeUInt32LE(offset, 18 + index * 16); // Image offset

        offset += buffer.length;
        imageBuffers.push(buffer);
    }

    const icoBuffer = Buffer.concat([header, ...imageBuffers]);
    return new Blob([icoBuffer], {
        type: 'image/x-icon',
    });
};

const convertAction: FormAction<Blob> = async (formData) => {
    'use server';
    const file = formData.get('file');
    if (!(file instanceof Blob)) {
        return {
            error: {
                code: 'INVALID_FILE',
                message: 'Invalid file',
            },
        };
    }
    try {
        const icoFile = await convertSvgtoIco(file);
        return { data: icoFile };
    } catch {
        return {
            error: {
                code: 'CONVERSION_ERROR',
                message: 'Error converting SVG to ICO',
            },
        };
    }
};

const Home = () => {
    return (
        <main className="w-full h-full flex flex-col items-center justify-center">
            <Form convertAction={convertAction} />
        </main>
    );
};

export const metadata: Metadata = {
    title: 'SVGico - Create favicon.ico from SVG',
    description:
        'Create an favicon.ico file for your website from an SVG file.',
};

export default Home;
