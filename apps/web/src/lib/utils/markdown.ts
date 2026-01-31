import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { createHighlighter } from 'shiki';
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript';
import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

/** Wrap <table> elements in a scrollable div */
function rehypeTableWrapper() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName === 'table' && parent && typeof index === 'number') {
        const wrapper: Element = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-wrapper'] },
          children: [node],
        };
        (parent as Element).children[index] = wrapper;
      }
    });
  };
}

let processorPromise: Promise<ReturnType<typeof unified>> | null = null;

function getProcessor() {
  if (!processorPromise) {
    processorPromise = createHighlighter({
      themes: ['one-dark-pro'],
      langs: [
        'javascript', 'typescript', 'python', 'bash', 'shell',
        'json', 'yaml', 'toml', 'markdown', 'html', 'css',
        'sql', 'go', 'rust', 'java', 'c', 'cpp',
        'jsx', 'tsx', 'svelte', 'vue', 'ruby', 'php',
        'dockerfile', 'diff', 'ini', 'xml',
      ],
      engine: createJavaScriptRegexEngine(),
    }).then((highlighter) => {
      return unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypePrettyCode, {
          theme: 'one-dark-pro',
          keepBackground: true,
          defaultLang: 'plaintext',
          getHighlighter: () => highlighter,
        })
        .use(rehypeKatex)
        .use(rehypeSlug)
        .use(rehypeAutolinkHeadings, {
          behavior: 'wrap',
          properties: {
            className: ['heading-anchor'],
          },
        })
        .use(rehypeTableWrapper)
        .use(rehypeStringify, { allowDangerousHtml: true });
    });
  }
  return processorPromise;
}

export async function renderMarkdown(content: string): Promise<string> {
  try {
    const processor = await getProcessor();
    const result = await processor.process(content);
    return String(result);
  } catch (err) {
    // Graceful fallback: return escaped content in a <pre> block
    console.error('Markdown render error:', err);
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre>${escaped}</pre>`;
  }
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDateTime(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}
