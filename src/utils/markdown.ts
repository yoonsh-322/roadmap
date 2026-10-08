import { marked } from 'marked';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

export function renderMarkdown(content: string): string {
  try {
    return marked.parse(content) as string;
  } catch (e) {
    console.error('Markdown parse error:', e);
    return content;
  }
}
