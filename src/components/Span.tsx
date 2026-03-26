import type { PositionedTimelineSpan } from '../timeline/types';

interface SpanProps {
    span: PositionedTimelineSpan;
}

function Span({ span }: SpanProps) {
    return (
        <div 
            className={`timeline span ${span.className ?? ''}`}
            style={{
                top: span.top,
                height: span.height,
                opacity: span.opacity ?? 1,
            }}
            title={span.label}
        />
    );
}

export default Span;
