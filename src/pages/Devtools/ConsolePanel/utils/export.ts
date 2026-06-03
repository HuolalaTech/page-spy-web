import type { SpyConsole } from '@huolala-tech/page-spy-types';

export type ConsoleExportFormat = 'json' | 'md';

type Translate = (key: string) => string;

interface ConsoleLogSnapshot {
  type?: string;
  value?: any;
  __atomId?: string;
  instanceId?: string;
}

interface NormalizedLog {
  type?: string;
  value: any;
  atomId?: string;
  instanceId?: string;
  previewOnly?: boolean;
}

interface NormalizedMessage {
  time?: number;
  logType: SpyConsole.DataType;
  url: string;
  logs: NormalizedLog[];
}

interface ConsoleExportPayload {
  exportedAt: string;
  count: number;
  mode: 'complete' | 'preview';
  warning?: string;
  logs: NormalizedMessage[];
}

export interface ConsoleExportResult {
  content: string;
  count: number;
  hasPreviewOnlyLog: boolean;
}

const COMPLETE_EXPORT_HINT =
  "Set SDK config consoleExportMode: 'complete' to export full object snapshots.";

const safeJsonParse = (value: string) => {
  try {
    return JSON.parse(value);
  } catch (err) {
    return value;
  }
};

const stringifyJson = (value: any) => {
  try {
    const result = JSON.stringify(value, null, 2);
    return result === undefined ? String(value) : result;
  } catch (err) {
    return String(value);
  }
};

const parseJsonLikeString = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || !['{', '['].includes(trimmed[0])) return undefined;

  try {
    return JSON.parse(trimmed);
  } catch (err) {
    return undefined;
  }
};

const getMarkdownFence = (content: string) => {
  let fence = '```';
  while (content.includes(fence)) {
    fence += '`';
  }
  return fence;
};

const formatCodeBlock = (content: string, language = 'text') => {
  const normalizedContent = content.replace(/\r\n/g, '\n');
  const fence = getMarkdownFence(normalizedContent);
  return `${fence}${language}\n${normalizedContent}\n${fence}`;
};

const formatInlineCode = (value: string) => `\`${value.replace(/`/g, '\\`')}\``;

const stringifyForMarkdown = (value: any) => {
  if (typeof value === 'string') {
    const parsed = parseJsonLikeString(value);
    if (parsed !== undefined) {
      return {
        language: 'json',
        content: stringifyJson(parsed),
      };
    }

    return {
      language: 'text',
      content: value,
    };
  }

  if (value === undefined) {
    return {
      language: 'text',
      content: 'undefined',
    };
  }

  if (value === null || typeof value === 'object' || Array.isArray(value)) {
    return {
      language: 'json',
      content: stringifyJson(value),
    };
  }

  return {
    language: 'text',
    content: String(value),
  };
};

const normalizeLog = (log: ConsoleLogSnapshot, t: Translate): NormalizedLog => {
  if (log?.type === 'json') {
    return {
      type: 'json',
      value:
        log.value === null
          ? t('console.non-serializable')
          : safeJsonParse(String(log.value)),
    };
  }

  if (log?.type === 'atom') {
    return {
      type: 'atom',
      value: log.value,
      atomId: log.__atomId,
      instanceId: log.instanceId,
      previewOnly: true,
    };
  }

  return {
    type: log?.type,
    value: log?.value,
  };
};

const createPayload = (
  messages: SpyConsole.DataItem[],
  t: Translate,
): ConsoleExportPayload => {
  const logs = messages.map((message) => ({
    time: message.time,
    logType: message.logType,
    url: message.url,
    logs: (message.logs || []).map((log) => normalizeLog(log, t)),
  }));
  const hasPreviewOnlyLog = logs.some((message) =>
    message.logs.some((log) => log.previewOnly),
  );

  return {
    exportedAt: new Date().toISOString(),
    count: logs.length,
    mode: hasPreviewOnlyLog ? 'preview' : 'complete',
    warning: hasPreviewOnlyLog ? COMPLETE_EXPORT_HINT : undefined,
    logs,
  };
};

const formatTime = (time?: number) => {
  if (!time) return '';
  return new Date(time).toISOString();
};

const formatLogAsMarkdown = (log: NormalizedLog, index: number) => {
  const { language, content } = stringifyForMarkdown(log.value);
  const metadata = [
    log.type ? `- Type: ${formatInlineCode(log.type)}` : '',
    log.atomId ? `- Atom ID: ${formatInlineCode(log.atomId)}` : '',
    log.instanceId ? `- Instance ID: ${formatInlineCode(log.instanceId)}` : '',
  ].filter(Boolean);

  return [
    `#### Argument ${index + 1}`,
    log.previewOnly ? `> ⚠️ Preview only. ${COMPLETE_EXPORT_HINT}` : '',
    ...metadata,
    formatCodeBlock(content, language),
  ]
    .filter(Boolean)
    .join('\n\n');
};

const formatAsMarkdown = (payload: ConsoleExportPayload) => {
  const header = [
    '# PageSpy Console Export',
    '',
    `- Exported at: ${formatInlineCode(payload.exportedAt)}`,
    `- Mode: ${formatInlineCode(payload.mode)}`,
    `- Count: ${payload.count}`,
    payload.warning ? `\n> ⚠️ ${payload.warning}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const body = payload.logs
    .map((message, messageIndex) => {
      const logs = message.logs.length
        ? message.logs
            .map((log, logIndex) => formatLogAsMarkdown(log, logIndex))
            .join('\n\n')
        : '_No arguments_';

      return [
        `## ${messageIndex + 1}. ${message.logType}`,
        '',
        `- Time: ${formatInlineCode(formatTime(message.time) || '-')}`,
        `- URL: ${formatInlineCode(message.url || '-')}`,
        `- Arguments: ${message.logs.length}`,
        '',
        logs,
      ].join('\n');
    })
    .join('\n\n---\n\n');

  return `${header}\n\n---\n\n${body}`;
};

export const formatConsoleExport = (
  messages: SpyConsole.DataItem[],
  format: ConsoleExportFormat,
  t: Translate,
): ConsoleExportResult => {
  const payload = createPayload(messages, t);
  const hasPreviewOnlyLog = payload.mode === 'preview';

  return {
    content:
      format === 'json'
        ? JSON.stringify(payload, null, 2)
        : formatAsMarkdown(payload),
    count: payload.count,
    hasPreviewOnlyLog,
  };
};

export const downloadConsoleExport = (
  content: string,
  format: ConsoleExportFormat,
) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `page-spy-console-${timestamp}.${format}`;
  const mime = format === 'json' ? 'application/json' : 'text/markdown';
  const blob = new Blob([content], {
    type: `${mime};charset=utf-8`,
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url));
};
