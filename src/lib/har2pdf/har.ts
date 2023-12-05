import type { Content, Cookie, Har, Header, Param } from 'har-format';
import { Buffer } from 'safe-buffer';

export type HarEntry = {
    startTime: Date;

    request: {
        httpVersion: string;
        method: string;

        scheme: 'http' | 'https';
        host: string;
        port: string;
        path: string;
        pathWithoutQuery: string;
        queryParams: { name: string; value: string }[];

        headers?: Header[];
        cookies?: Cookie[];

        content?: string | Param[];
    };

    response: {
        status: number;
        statusText: string;
        httpVersion: string;

        headers?: Header[];
        cookies?: Cookie[];

        content?: string;
    };
};

export const unhar = (har: Har): HarEntry[] =>
    har.log.entries.map((e) => {
        const url = new URL(e.request.url);

        const decodeContent = (content?: Content) => {
            if (!content?.text) return undefined;

            if (content.encoding) {
                if (content.encoding !== 'base64') return Buffer.from(content.text, 'base64').toString('binary');

                throw new Error(`Unsupported content encoding: ${content.encoding}`);
            }

            return content.text;
        };

        return {
            startTime: new Date(e.startedDateTime),

            request: {
                httpVersion: e.request.httpVersion,
                method: e.request.method,

                scheme: url.protocol.replace(':', '') as 'http' | 'https',
                host: url.hostname,
                port: url.port,
                path: url.pathname + url.search,
                pathWithoutQuery: url.pathname,
                queryParams: [...url.searchParams.entries()].map(([name, value]) => ({ name, value })),

                headers: e.request.headers,
                cookies: e.request.cookies,

                content:
                    e.request.postData?.params && e.request.postData?.params.length > 0
                        ? e.request.postData?.params
                        : e.request.postData?.text,
            },

            response: {
                status: e.response.status,
                statusText: e.response.statusText,
                httpVersion: e.response.httpVersion,

                headers: e.response.headers,
                cookies: e.response.cookies,

                content: decodeContent(e.response.content),
            },
        };
    });
