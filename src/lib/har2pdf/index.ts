import { createTypstCompiler } from '@myriaddreamin/typst.ts/dist/esm/compiler.mjs';
import type { Cookie, Har, Header, Param } from 'har-format';
import hexy from 'hexy';
import { unhar, type HarEntry } from './har';
import { getTranslator } from './i18n';

import translationsDe from './i18n/de.json';
import translationsEn from './i18n/en.json';
import translationsFr from './i18n/fr.json';

const translations = {
    en: translationsEn,
    de: translationsDe,
    fr: translationsFr,
};

export type RenderOptions = {
    /** The language to use. (default: `en`) */
    language?: keyof typeof translations;

    /** The length in bytes after which request or response content should be truncated. (default: no truncation) */
    truncateContent?: number;
    /** Whether to include responses as well (default: `true`). */
    includeResponses?: boolean;
};

export const generateTyp = (entries: (HarEntry & { index?: number })[], options?: RenderOptions) => {
    const translation = translations[options?.language ?? 'en'];
    if (!translation) throw new Error(`Unsupported language: ${options?.language}`);
    const _ = getTranslator(translation, translationsEn);

    /**
     * Wrap content in a raw/code block, properly escaping user input (cf.
     * https://github.com/tweaselORG/meta/issues/42#issuecomment-1838486416).
     */
    const $ = (s: string | undefined) => (s === undefined ? '' : `\`\`\` ${s.replace(/`/g, '\u200b`')} \`\`\``);

    const renderDate = (date: Date | string | undefined) => (date ? new Date(date).toISOString() : undefined);
    const renderHeaders = (headers: Header[] | undefined) =>
        headers && headers.length > 0
            ? headers.map((h) => `/ ${$(h.name)}: ${$(h.value)}`).join('\n')
            : `_${_('har.none')}_`;
    const renderCookies = (cookies: Cookie[] | undefined) =>
        cookies && cookies.length > 0
            ? `
        #table(
            columns: (auto, auto, auto, auto, auto, auto, auto),
            [${_('har.name')}], [${_('har.value')}], [${_('har.path')}], [${_('har.domain')}], [${_(
                  'har.expires'
              )}], [${_('har.http-only')}], [${_('har.secure')}],
            ${cookies
                .map(
                    (c) => `
                [${$(c.name)}], [${$(c.value)}], [${$(c.path)}], [${$(c.domain)}], [${$(renderDate(c.expires))}], [${
                        c.httpOnly ? '#sym.checkmark' : ''
                    }], [${c.secure ? '#sym.checkmark' : ''}]`
                )
                .join(',\n')}
        )
        `
            : `_${_('har.none')}_`;
    const renderContent = (content?: string | Param[]) => {
        if (!content) return `_${_('har.none')}_`;

        if (typeof content !== 'string')
            return content
                .map(
                    (c) => `
                         - ${_('har.name')}: ${$(c.name)} \\
                           ${c.value ? `${_('har.value')}: ${$(c.value)} \\` : ''}
                           ${c.fileName ? `${_('har.file-name')}: ${$(c.fileName)} \\` : ''}
                           ${c.contentType ? `${_('har.content-type')}: ${$(c.contentType)} \\` : ''}`
                )
                .join('');

        const truncatedContent = content.slice(0, options?.truncateContent);

        return `${
            // Contains non-printable characters?
            $(/\p{C}/gu.test(content) ? hexy.hexy(truncatedContent).trim() : truncatedContent)
        }
${
    truncatedContent.length < content.length
        ? `\n_(${_('har.truncated-after')} ${options?.truncateContent} ${_('har.bytes')})_`
        : ''
}`;
    };

    return `
#show raw: t => for c in t.text [#c.replace(c, c + sym.zws)]
#set heading(numbering: "1.")
#show heading.where(level: 4): it => text(weight: "regular", style: "italic", it)

${entries
    .map((r, i) => {
        const index = r.index ?? i;
        return `
== ${$(r.request.method + ' ' + r.request.host)} (${renderDate(r.startTime)}) <har2pdf-e${index}>

=== ${_('har.request')} <har2pdf-e${index}-req>

==== ${_('har.general')} <har2pdf-e${index}-req-general>

/ ${_('har.method')}: ${$(r.request.method)}
/ ${_('har.http-version')}: ${$(r.request.httpVersion)} #v(0.8em)
/ ${_('har.scheme')}: ${$(r.request.scheme)}
/ ${_('har.host')}: ${$(r.request.host)}
/ ${_('har.file-name')}: ${$(r.request.pathWithoutQuery)}
${r.request.port ? `/ ${_('har.port')}: ${$(r.request.port)}` : ''}

==== ${_('har.query-params')} <har2pdf-e${index}-req-query-params>

${
    r.request.queryParams.length > 0
        ? r.request.queryParams.map((q) => `/ ${$(q.name)}: ${$(q.value)}`).join('\n')
        : `_${_('har.none')}_`
}

==== ${_('har.headers')} <har2pdf-e${index}-req-headers>

${renderHeaders(r.request.headers)}

==== ${_('har.cookies')} <har2pdf-e${index}-req-cookies>

${renderCookies(r.request.cookies)}

==== ${_('har.content')} <har2pdf-e${index}-req-content>

${renderContent(r.request.content)}

${
    options?.includeResponses !== false
        ? `
=== ${_('har.response')} <har2pdf-e${index}-res>

==== ${_('har.general')} <har2pdf-e${index}-res-general>

/ ${_('har.status')}: ${$(r.response.status + ' ' + r.response.statusText)}
/ ${_('har.http-version')}: ${$(r.response.httpVersion)}

==== ${_('har.headers')} <har2pdf-e${index}-res-headers>

${renderHeaders(r.response.headers)}

==== ${_('har.cookies')} <har2pdf-e${index}-res-cookies>

${renderCookies(r.response.cookies)}

==== ${_('har.content')} <har2pdf-e${index}-res-content>

${renderContent(r.response.content)}
          `
        : ''
}
`;
    })
    .join('\n')}
`;
};

export const har2Pdf = async (har: Har, options?: RenderOptions) => {
    const entries = unhar(har);

    const mainFilePath = '/main.typ';
    const source = generateTyp(entries, options);

    const cc = createTypstCompiler();
    await cc.init({ beforeBuild: [] });

    cc.addSource(mainFilePath, source);

    return await cc.compile({ mainFilePath, format: 'pdf' });
};

export { unhar, type HarEntry };
