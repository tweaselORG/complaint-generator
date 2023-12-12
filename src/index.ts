import { createTypstCompiler } from '@myriaddreamin/typst.ts/dist/esm/compiler.mjs';
import { readFileSync } from 'fs';
import type { Har } from 'har-format';
import Nunjucks from 'nunjucks';
import { adapters, type Adapter, type AnnotatedResult } from 'trackhar';
import { generateTyp as generateTypForHar, unhar } from './lib/har2pdf';
import { translations } from './translations';

const templates = {
    en: {
        report: readFileSync(new URL('../templates/en/report.typ', import.meta.url), 'utf-8'),
        notice: readFileSync(new URL('../templates/en/notice.typ', import.meta.url), 'utf-8'),
        style: readFileSync(new URL('../templates/en/style.typ', import.meta.url), 'utf-8'),
    },
};

export type GenerateOptions = {
    type: 'report' | 'notice';
    language: 'en';

    analysisMeta: {
        platform: 'Android' | 'iOS';

        appName: string;
        appVersion: string;
        appUrl?: string;

        analysisDate: Date;
        analysisPlatformVersion: string;

        harMd5?: string;
    };
    har: Har;
    trackHarResult: (null | AnnotatedResult)[];
};

export const generate = async (options: GenerateOptions) => {
    const harEntries = unhar(options.har);
    const trackHarResult = options.trackHarResult
        .map((transmissions, harIndex) =>
            transmissions === null || transmissions.length === 0
                ? null
                : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  { harIndex, adapter: transmissions[0]!.adapter, transmissions }
        )
        .filter((e): e is NonNullable<typeof e> => e !== null);
    const findings = trackHarResult.reduce<
        Record<
            string,
            { adapter: Adapter; requests: typeof trackHarResult; receivedData: Record<string, Array<string>> }
        >
    >((acc, req) => {
        if (!acc[req.adapter]) {
            const adapter = adapters.find((a) => a.tracker.slug + '/' + a.slug === req.adapter);
            if (!adapter) throw new Error(`Unknown adapter: ${req.adapter}`);
            acc[req.adapter] = {
                adapter,
                requests: [],
                receivedData: {},
            };
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        acc[req.adapter]!.requests.push(req);

        for (const transmission of req.transmissions) {
            if (!acc[req.adapter]?.receivedData[transmission.property]) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                acc[req.adapter]!.receivedData[transmission.property] = [];
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            acc[req.adapter]!.receivedData[transmission.property] = [
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                ...new Set([...acc[req.adapter]!.receivedData[transmission.property]!, transmission.value]),
            ];
        }

        return acc;
    }, {});

    const nunjucks = Nunjucks.configure({ autoescape: true, throwOnUndefined: true });
    nunjucks.addFilter('dateFormat', (date: Date | string | undefined) =>
        date ? new Date(date).toLocaleString(options.language, { dateStyle: 'long', timeStyle: 'long' }) : undefined
    );
    nunjucks.addFilter('timeFormat', (date: Date | string | undefined) =>
        date ? new Date(date).toLocaleTimeString(options.language) : undefined
    );
    // Wrap content in a raw/code block, properly escaping user input.
    nunjucks.addFilter(
        'code',
        (s: string | undefined) =>
            new Nunjucks.runtime.SafeString(s === undefined ? '' : `\`\`\` ${(s + '').replace(/`/g, '`\u200b')}\`\`\``)
    );
    // Translate.
    nunjucks.addGlobal(
        't',
        (key: keyof (typeof translations)['en']) => (
            (() => {
                const translation = translations[options.language][key];
                if (!translation) throw new Error(`Translation not found: ${key}`);
            })(),
            translations[options.language][key]
        )
    );

    const typSource = nunjucks.renderString(templates[options.language][options.type], {
        analysisMeta: options.analysisMeta,
        harEntries,
        trackHarResult,
        findings,
    });

    const mainFilePath = '/main.typ';

    const cc = createTypstCompiler();
    await cc.init({ beforeBuild: [] });

    cc.addSource(mainFilePath, typSource);
    cc.addSource('/style.typ', templates[options.language].style);
    if (options.type === 'report')
        cc.addSource(
            '/har.typ',
            generateTypForHar(
                harEntries
                    .map((e, index) => ({ ...e, index }))
                    .filter((e) => trackHarResult.some((r) => r.harIndex === e.index)),
                { includeResponses: false, truncateContent: 4096 }
            )
        );

    return await cc.compile({ mainFilePath, format: 'pdf' });
};
