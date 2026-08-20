// Vendored Gemini client. Exposes only the slice of the @google/genai surface the prompt improver uses —
// models.generateContent() and models.list() — so the tool's own code is unchanged whether the SDK is
// installed here or not. Most repos in this fleet have no @google/genai, and installing one into each of them
// is out of scope, so the fallback is a direct REST call on global fetch (Node >= 18).

const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta';
const ERROR_BODY_CAP = 400;

// Older Gemini API surfaces name the structured-output field `responseSchema` rather than `responseJsonSchema`.
// The first call that gets rejected for the field name flips this for the rest of the process, so one probe
// is paid once instead of on every pass.
let schemaField = 'responseJsonSchema';
let sdk = null;
let sdkChecked = false;

const requireKey = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key || !key.trim()) throw new Error('GEMINI_API_KEY is not set — add it to this repo\'s .env or export it before running.');

    return key;
};

// Errors must carry the HTTP status: the tool retries 429/500/502/503/504 and falls back to its pinned model
// on 404. A bare Error silently disables both.
const apiError = (status, statusText, body) => {
    const detail = String(body || '').replace(/\s+/g, ' ').trim().slice(0, ERROR_BODY_CAP);
    const error = new Error(`Gemini API ${status} ${statusText || ''}`.trim() + (detail ? `: ${detail}` : ''));
    error.status = status;

    return error;
};

const loadSdk = async () => {
    if (sdkChecked) return sdk;
    sdkChecked = true;
    try {
        const module = await import('@google/genai');
        const GoogleGenAI = module.GoogleGenAI || module.default?.GoogleGenAI;
        sdk = GoogleGenAI ? new GoogleGenAI({apiKey: requireKey()}) : null;
    } catch {
        // Not installed here, or installed but unusable — REST covers both.
        sdk = null;
    }

    return sdk;
};

const isSchemaFieldRejection = (error) => Number(error?.status) === 400 && /responsejsonschema/i.test(String(error?.message || ''));

const buildRestBody = (request, field) => {
    const config = request?.config || {};
    const generationConfig = {};

    if (config.maxOutputTokens !== undefined) generationConfig.maxOutputTokens = config.maxOutputTokens;
    if (config.responseMimeType !== undefined) generationConfig.responseMimeType = config.responseMimeType;
    if (config.thinkingConfig !== undefined) generationConfig.thinkingConfig = config.thinkingConfig;
    if (config.responseJsonSchema !== undefined) generationConfig[field] = config.responseJsonSchema;

    const body = {contents: request.contents, generationConfig};
    if (config.systemInstruction) body.systemInstruction = {parts: [{text: String(config.systemInstruction)}]};

    return body;
};

const postGenerate = async (request, field) => {
    const key = requireKey();
    const response = await fetch(`${API_ROOT}/models/${encodeURIComponent(request.model)}:generateContent`, {
        method: 'POST',
        headers: {'content-type': 'application/json', 'x-goog-api-key': key},
        body: JSON.stringify(buildRestBody(request, field)),
        signal: request?.config?.abortSignal
    });

    if (!response.ok) throw apiError(response.status, response.statusText, await response.text().catch(() => ''));

    return response.json();
};

const restGenerateContent = async (request) => {
    try {
        return await postGenerate(request, schemaField);
    } catch (error) {
        if (schemaField !== 'responseJsonSchema' || !isSchemaFieldRejection(error)) throw error;
        // Structured output is load-bearing — every pass in the tool parses JSON — so a dropped schema would
        // surface much later as a confusing parse error. Flip the field name once and say so out loud.
        console.log('[gemini-client] responseJsonSchema rejected by the API — retrying this call and all later ones with responseSchema');
        schemaField = 'responseSchema';

        return await postGenerate(request, schemaField);
    }
};

const restList = async () => {
    const key = requireKey();
    const models = [];
    let pageToken = '';

    for (;;) {
        const url = `${API_ROOT}/models?pageSize=200${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
        const response = await fetch(url, {headers: {'x-goog-api-key': key}});
        if (!response.ok) throw apiError(response.status, response.statusText, await response.text().catch(() => ''));
        const page = await response.json();
        (page.models || []).forEach((entry) => models.push(entry));
        pageToken = page.nextPageToken || '';
        if (!pageToken) break;
    }

    return models;
};

let client = null;

/**
 * The tool calls this synchronously and awaits the method, so the SDK probe happens lazily inside each call
 * rather than at import time.
 */
export const getGeminiAI = () => {
    if (client) return client;

    client = {
        models: {
            generateContent: async (request) => {
                const installed = await loadSdk();
                if (installed) return await installed.models.generateContent(request);

                return await restGenerateContent(request);
            },
            list: async () => {
                const installed = await loadSdk();
                if (installed) return await installed.models.list();

                return await restList();
            }
        }
    };

    return client;
};
