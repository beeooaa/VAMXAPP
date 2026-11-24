import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const PRIMARY_MODEL = 'gemini-4-hydrogen';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isTransientError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /429|503|RESOURCE_EXHAUSTED|UNAVAILABLE|timeout|ECONNRESET|ETIMEDOUT/i.test(msg);
}

async function generateWithFallback(
  ai: GoogleGenAI,
  paramsBuilder: (model: string) => Parameters<GoogleGenAI['models']['generateContent']>[0]
) {
  let lastError: unknown = null;
  const attempts: Array<{ model: string; delayMs: number }> = [
    { model: PRIMARY_MODEL, delayMs: 250 },
    { model: PRIMARY_MODEL, delayMs: 650 },
    { model: FALLBACK_MODEL, delayMs: 0 },
  ];

  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    try {
      return await ai.models.generateContent(paramsBuilder(attempt.model));
    } catch (err) {
      lastError = err;
      if (!isTransientError(err) && i === 0) {
        // Still allow fallback model on non-key upstream failures
        if (/API_KEY_INVALID|PERMISSION_DENIED/i.test(String(err))) {
          throw err;
        }
      }
      if (attempt.delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, attempt.delayMs));
      }
    }
  }
  throw lastError;
}

const LANG_NAME_MAP: Record<string, string> = {
  中文: 'Simplified Chinese (简体中文)',
  简体中文: 'Simplified Chinese (简体中文)',
  越南语: 'Vietnamese (Tiếng Việt with full diacritics)',
  英语: 'English',
  zh: 'Simplified Chinese (简体中文)',
  vi: 'Vietnamese (Tiếng Việt with full diacritics)',
  en: 'English',
};

function describeLang(raw: string): string {
  return LANG_NAME_MAP[raw] || raw;
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    const aiConfigured = Boolean(getAiClient());
    res.json({
      ok: true,
      service: 'vamx-interpretation-workbench',
      aiConfigured,
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/translate', async (req, res) => {
    const startedAt = Date.now();
    const body = (req.body ?? {}) as {
      text?: unknown;
      sourceLang?: unknown;
      targetLang?: unknown;
      glossaryHints?: unknown;
      instructionNote?: unknown;
    };

    const text = typeof body.text === 'string' ? body.text.trim() : '';
    const sourceLang = typeof body.sourceLang === 'string' ? body.sourceLang.trim() : '中文';
    const targetLang = typeof body.targetLang === 'string' ? body.targetLang.trim() : '越南语';
    const glossaryHints = Array.isArray(body.glossaryHints)
      ? body.glossaryHints.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).slice(0, 60)
      : [];
    const instructionNote =
      typeof body.instructionNote === 'string' ? body.instructionNote.trim().slice(0, 300) : '';

    if (!text) {
      res.status(400).json({ error: 'Source text is required' });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server',
        code: 'AI_NOT_CONFIGURED',
        latencyMs: Date.now() - startedAt,
      });
      return;
    }

    const systemInstruction = [
      `You are an enterprise simultaneous conference interpreter translating live spoken speech from ${describeLang(sourceLang)} into ${describeLang(targetLang)}.`,
      'Preserve exact personal names, locations, quantities, dates, currency amounts, and domain terminology.',
      glossaryHints.length > 0
        ? `Required terminology glossary hints (keep accurate & consistent): ${glossaryHints.join(', ')}.`
        : '',
      instructionNote ? `Additional context note: ${instructionNote}` : '',
      'If target language is Vietnamese, strictly preserve complete Vietnamese tonal diacritics.',
      'Return strict JSON matching the schema with natural, broadcast-ready interpreted phrasing.',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const response = await generateWithFallback(ai, (model) => ({
        model,
        contents: `Translate this spoken utterance:\n${text}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translation: {
                type: Type.STRING,
                description: 'Natural simultaneous interpretation in the target language.',
              },
              terminologyMatched: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Glossary terms or proper nouns detected and preserved.',
              },
            },
            required: ['translation', 'terminologyMatched'],
          },
        },
      }));

      const rawJson = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawJson) as {
        translation?: string;
        terminologyMatched?: string[];
      };

      const translation = (parsed.translation || '').trim();
      if (!translation) {
        res.status(502).json({
          error: 'Empty translation returned by AI model',
          latencyMs: Date.now() - startedAt,
        });
        return;
      }

      res.json({
        translation,
        terminologyMatched: Array.isArray(parsed.terminologyMatched) ? parsed.terminologyMatched : [],
        latencyMs: Date.now() - startedAt,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upstream translation failed';
      res.status(502).json({
        error: message,
        code: 'UPSTREAM_TRANSLATION_ERROR',
        latencyMs: Date.now() - startedAt,
      });
    }
  });

  app.post('/api/minutes', async (req, res) => {
    const body = (req.body ?? {}) as {
      roomName?: unknown;
      sourceLang?: unknown;
      targetLang?: unknown;
      uiLocale?: unknown;
      utterances?: unknown;
    };

    const roomName = typeof body.roomName === 'string' ? body.roomName.trim() : 'Interpretation Session';
    const sourceLang = typeof body.sourceLang === 'string' ? body.sourceLang : '中文';
    const targetLang = typeof body.targetLang === 'string' ? body.targetLang : '越南语';
    const uiLocale =
      body.uiLocale === 'en' || body.uiLocale === 'vi' || body.uiLocale === 'zh'
        ? body.uiLocale
        : 'zh';

    const rawUtterances = Array.isArray(body.utterances) ? body.utterances : [];
    const utterances = rawUtterances
      .filter((u): u is Record<string, unknown> => Boolean(u && typeof u === 'object'))
      .map((u) => ({
        time: typeof u.time === 'string' ? u.time : '00:00',
        speakerName: typeof u.speakerName === 'string' ? u.speakerName : 'Speaker',
        sourceText: typeof u.sourceText === 'string' ? u.sourceText : '',
        translatedText: typeof u.translatedText === 'string' ? u.translatedText : '',
      }))
      .slice(0, 200);

    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server',
        code: 'AI_NOT_CONFIGURED',
      });
      return;
    }

    const tbdToken = uiLocale === 'en' ? 'TBD' : uiLocale === 'vi' ? 'Chờ xác nhận' : '待确认';
    const localeLabel = describeLang(uiLocale);
    const missingNote =
      uiLocale === 'en'
        ? '[Missing translation]'
        : uiLocale === 'vi'
        ? '[Thiếu bản dịch]'
        : '[译文缺失，待人工补录]';

    const transcriptText = utterances
      .map(
        (u) =>
          `[${u.time}] ${u.speakerName} | SRC: ${u.sourceText} | TGT: ${u.translatedText || missingNote}`
      )
      .join('\n');

    const systemInstruction = [
      `You are an executive multilingual conference secretary generating structured bilingual meeting minutes in ${localeLabel}.`,
      `Write EVERY output field strictly in ${localeLabel} (for Vietnamese keep complete diacritics).`,
      `Ground every conclusion, action item, and risk strictly in the provided transcript. Do NOT invent owners or deadlines.`,
      `If an action item does not explicitly state an owner or deadline in the transcript, set owner or deadline strictly to "${tbdToken}".`,
      `If any utterance shows "${missingNote}", mention it in risksAndOpenQuestions so reviewers can follow up.`,
    ].join('\n');

    try {
      const response = await generateWithFallback(ai, (model) => ({
        model,
        contents: `Room: ${roomName}\nPair: ${sourceLang} -> ${targetLang}\nUtterances:\n${transcriptText || '[No utterances recorded yet]'}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              topics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              topicAnalyses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    topic: { type: Type.STRING },
                    analysis: { type: Type.STRING },
                  },
                  required: ['topic', 'analysis'],
                },
              },
              keyConclusions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    timestamp: { type: Type.STRING },
                  },
                  required: ['text', 'timestamp'],
                },
              },
              actionItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    task: { type: Type.STRING },
                    owner: { type: Type.STRING },
                    deadline: { type: Type.STRING },
                    sourceTimestamp: { type: Type.STRING },
                  },
                  required: ['task', 'owner', 'deadline', 'sourceTimestamp'],
                },
              },
              risksAndOpenQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'summary',
              'topics',
              'topicAnalyses',
              'keyConclusions',
              'actionItems',
              'risksAndOpenQuestions',
            ],
          },
        },
      }));

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate meeting minutes';
      res.status(502).json({
        error: message,
        code: 'UPSTREAM_MINUTES_ERROR',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VAMX server running on http://0.0.0.0:${PORT}`);
  });
}

createApp();
