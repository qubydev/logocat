import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractLogo } from './llm';

const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
};

const BANNER_KEYWORDS = ['ogimage', 'og-image', 'blogheader', 'newsletter', 'social', 'banner', 'hero', 'cover', 'thumbnail'];

const isBanner = (url) => {
    const lower = url.toLowerCase();
    return BANNER_KEYWORDS.some((kw) => lower.includes(kw));
};

// --- Approaches ---

const fetchLogoFromJsonLd = ($) => {
    const scripts = $('script[type="application/ld+json"]');
    if (!scripts.length) return null;
    for (const el of scripts.toArray()) {
        try {
            const json = JSON.parse($(el).html());
            const items = Array.isArray(json) ? json : [json];
            for (const item of items) {
                if (item.logo) {
                    const logo = typeof item.logo === 'string' ? item.logo : item.logo?.url;
                    if (logo && !isBanner(logo)) return logo;
                }
            }
        } catch (_) { }
    }
    return null;
};

const fetchLogoFromSvgFavicon = ($, homePage) => {
    const href = $('link[rel="icon"], link[rel="shortcut icon"]')
        .filter((_, el) => {
            const h = $(el).attr('href') ?? '';
            const type = $(el).attr('type') ?? '';
            return type === 'image/svg+xml' || h.endsWith('.svg');
        })
        .first()
        .attr('href');
    if (!href) return null;
    return href.startsWith('http') ? href : `${homePage}${href.startsWith('/') ? '' : '/'}${href}`;
};

const fetchLogoFromAppleTouchIcon = ($, homePage) => {
    const href = $('link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]').first().attr('href');
    if (!href) return null;
    return href.startsWith('http') ? href : `${homePage}${href.startsWith('/') ? '' : '/'}${href}`;
};

const fetchLogoFromCommonPaths = async (homePage) => {
    const paths = [
        '/logo.svg', '/logo.png', '/logo.webp',
        '/images/logo.svg', '/images/logo.png',
        '/assets/logo.svg', '/assets/logo.png',
        '/img/logo.svg', '/img/logo.png',
        '/static/logo.svg', '/static/logo.png',
    ];
    const results = await Promise.all(
        paths.map(async (path) => {
            const url = `${homePage}${path}`;
            const response = await axios.head(url, {
                timeout: 8000,
                headers: BROWSER_HEADERS,
                validateStatus: () => true,
            });
            return response.status === 200 ? url : null;
        })
    );
    return results.find(Boolean) ?? null;
};

const extractImagesForAi = ($, homePage) => {
    const candidates = [];
    $('header img, nav img').each((_, el) => {
        const src = $(el).attr('src') ?? '';
        const alt = $(el).attr('alt') ?? '';
        const cls = $(el).attr('class') ?? '';
        const id = $(el).attr('id') ?? '';
        if (!src) return;
        const absoluteSrc =
            src.startsWith('http') || src.startsWith('data:')
                ? src
                : `${homePage}${src.startsWith('/') ? '' : '/'}${src}`;
        candidates.push({ src: absoluteSrc, alt, class: cls, id });
    });
    return candidates;
};

const fetchLogoFromAi = async ($, homePage) => {
    const candidates = extractImagesForAi($, homePage);
    if (!candidates.length) return null;
    const result = await extractLogo(candidates.slice(0, 15));
    return result && result !== 'null' ? result : null;
};

// --- Main ---

export const fetchLogo = async (link) => {
    let url: any;
    try {
        url = new URL(link.startsWith('http') ? link : `https://${link}`);
    } catch (_) {
        return { success: false, logo: null, error: 'Invalid URL' };
    }

    if (!url.hostname.includes('.')) {
        return { success: false, logo: null, error: 'Invalid URL' };
    }

    try {
        const homePage = `${url.protocol}//${url.hostname}`;

        const { data: html } = await axios.get(homePage, {
            timeout: 15000,
            headers: BROWSER_HEADERS,
        });
        const $ = cheerio.load(html);

        const logo =
            fetchLogoFromJsonLd($) ??
            fetchLogoFromSvgFavicon($, homePage) ??
            fetchLogoFromAppleTouchIcon($, homePage) ??
            await fetchLogoFromCommonPaths(homePage) ??
            await fetchLogoFromAi($, homePage) ??
            null;

        return { success: !!logo, logo, error: null };
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 403) {
            return { success: false, logo: null, error: 'Protected content can not be accessed.' };
        }
        return { success: false, logo: null, error: err.message };
    }
};