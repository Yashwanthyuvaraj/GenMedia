import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const renderLines = () => {
        const lines = content.split('\n');
        // Fix: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
        const elements: React.ReactElement[] = [];
        let listItems: string[] = [];

        const flushList = () => {
            if (listItems.length > 0) {
                elements.push(
                    <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-2 my-4">
                        {listItems.map((item, i) => (
                            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                    </ul>
                );
                listItems = [];
            }
        };
        
        const processInline = (text: string) => {
            return text
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-100">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>');
        };

        lines.forEach((line, index) => {
            if (line.startsWith('# ')) {
                flushList();
                const html = processInline(line.substring(2));
                elements.push(<h1 key={index} className="text-2xl font-bold text-sky-400 mb-4" dangerouslySetInnerHTML={{ __html: html }} />);
            } else if (line.startsWith('## ')) {
                flushList();
                const html = processInline(line.substring(3));
                elements.push(<h2 key={index} className="text-xl font-semibold text-slate-200 mt-6 mb-3" dangerouslySetInnerHTML={{ __html: html }} />);
            } else if (line.startsWith('* ') || line.startsWith('- ')) {
                listItems.push(processInline(line.substring(2)));
            } else if (line.trim() !== '') {
                flushList();
                const html = processInline(line);
                elements.push(<p key={index} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />);
            }
        });
        
        flushList(); // Add any remaining list items

        return elements;
    };

    return <div className="text-slate-300">{renderLines()}</div>;
};

export default MarkdownRenderer;
