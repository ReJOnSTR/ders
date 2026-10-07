'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * MathText renders text containing LaTeX math formulas:
 * - Inline math: $formula$ or \(formula\)
 * - Display math: $$formula$$ or \[formula\]
 * - Highlights: ==text==
 * - Bold: **text**
 * - Underline: __text__ or <u>text</u>
 */
export default function MathText({ content, className = '', inline = false }: MathTextProps) {
  const renderedElements = useMemo(() => {
    if (!content) return null;

    // Split text by display math ($$...$$) and inline math ($...$)
    // Regex matches $$...$$ or $...$
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g);

    return parts.map((part, index) => {
      // Check display math $$...$$
      if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="my-1.5 block overflow-x-auto text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={index} className="font-mono text-red-500">{part}</span>;
        }
      }

      // Check inline math $...$
      if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
        const math = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="inline-math inline-block align-baseline px-0.5"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={index} className="font-mono text-red-500">{part}</span>;
        }
      }

      // Parse rich text highlights: ==highlight==, **bold**, __underline__
      return (
        <span key={index}>
          {parseRichText(part)}
        </span>
      );
    });
  }, [content]);

  if (inline) {
    return <span className={className}>{renderedElements}</span>;
  }

  return <span className={className}>{renderedElements}</span>;
}

function parseRichText(text: string): React.ReactNode {
  if (!text) return null;

  // Split by highlights ==...==, bold **...**, underline __...__
  const tokenRegex = /(==[\s\S]*?==|\*\*[\s\S]*?\*\*|__[\s\S]*?__|<u>[\s\S]*?<\/u>)/g;
  const segments = text.split(tokenRegex);

  return segments.map((seg, i) => {
    if (seg.startsWith('==') && seg.endsWith('==') && seg.length >= 4) {
      return (
        <mark
          key={i}
          className="bg-amber-200/90 dark:bg-amber-400/30 text-slate-900 dark:text-amber-200 px-1 py-0.5 rounded-xs font-semibold"
        >
          {seg.slice(2, -2)}
        </mark>
      );
    }
    if (seg.startsWith('**') && seg.endsWith('**') && seg.length >= 4) {
      return <strong key={i} className="font-black text-slate-900 dark:text-white">{seg.slice(2, -2)}</strong>;
    }
    if (seg.startsWith('__') && seg.endsWith('__') && seg.length >= 4) {
      return <span key={i} className="underline underline-offset-2 decoration-stone-900 dark:decoration-white font-bold">{seg.slice(2, -2)}</span>;
    }
    if (seg.startsWith('<u>') && seg.endsWith('</u>') && seg.length >= 7) {
      return <span key={i} className="underline underline-offset-2 decoration-stone-900 dark:decoration-white font-bold">{seg.slice(3, -4)}</span>;
    }
    return seg;
  });
}
