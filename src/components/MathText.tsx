import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  text: string;
  className?: string;
}

export default function MathText({ text, className = '' }: MathTextProps) {
  if (!text) return null;

  try {
    // Split by block math $$ ... $$
    const blockParts = text.split(/(\$\$.*?\$\$)/gs);

    return (
      <span className={`inline-block ${className}`}>
        {blockParts.map((part, index) => {
          if (part.startsWith('$$') && part.endsWith('$$')) {
            const formula = part.slice(2, -2);
            try {
              const html = katex.renderToString(formula, { 
                displayMode: true, 
                throwOnError: false,
                trust: true 
              });
              return (
                <div 
                  key={index} 
                  className="my-2 overflow-x-auto max-w-full text-center py-1 bg-gray-50/50 dark:bg-slate-900/40 rounded px-2 border border-slate-100 dark:border-slate-800/30"
                  dangerouslySetInnerHTML={{ __html: html }} 
                />
              );
            } catch (err) {
              return <code key={index} className="block my-2 text-rose-500 bg-rose-50/50 p-1 rounded text-xs">{part}</code>;
            }
          } else {
            // Split the remaining plain text by inline math $ ... $
            const inlineParts = part.split(/(\$.*?\$)/g);
            return (
              <React.Fragment key={index}>
                {inlineParts.map((subPart, subIndex) => {
                  if (subPart.startsWith('$') && subPart.endsWith('$')) {
                    const formula = subPart.slice(1, -1);
                    try {
                      const html = katex.renderToString(formula, { 
                        displayMode: false, 
                        throwOnError: false,
                        trust: true
                      });
                      return (
                        <span 
                          key={subIndex} 
                          className="inline-block px-1 align-middle"
                          dangerouslySetInnerHTML={{ __html: html }} 
                        />
                      );
                    } catch (err) {
                      return <code key={subIndex} className="text-rose-500 bg-rose-50/50 px-1 rounded text-xs font-mono">{subPart}</code>;
                    }
                  } else {
                    return <span key={subIndex} className="whitespace-pre-wrap">{subPart}</span>;
                  }
                })}
              </React.Fragment>
            );
          }
        })}
      </span>
    );
  } catch (e) {
    return <span className={className}>{text}</span>;
  }
}
