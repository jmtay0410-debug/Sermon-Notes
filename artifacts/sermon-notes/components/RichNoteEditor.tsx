'use dom';

import React, { useEffect, useRef } from 'react';
import type { Ref } from 'react';
import { useDOMImperativeHandle, type DOMImperativeFactory } from 'expo/dom';

export interface RichNoteEditorRef extends DOMImperativeFactory {
  focus: (...args: any[]) => void;
  bold: (...args: any[]) => void;
  italic: (...args: any[]) => void;
  underline: (...args: any[]) => void;
  bullets: (...args: any[]) => void;
  heading: (...args: any[]) => void;
  quote: (...args: any[]) => void;
  insertText: (...args: any[]) => void;
  setHighlightMode: (...args: any[]) => void;
  setHighlightColor: (...args: any[]) => void;
}

type CaretPoint = { node: Node; offset: number };

type Props = {
  ref: Ref<RichNoteEditorRef>;
  dom?: import('expo/dom').DOMProps;
  sermonKey: string;
  initialHtml: string;
  textColor: string;
  placeholderColor: string;
  onContentChange: (html: string, text: string) => Promise<void>;
};

function caretPointFromCoordinates(x: number, y: number): CaretPoint | null {
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };

  const position = doc.caretPositionFromPoint?.(x, y);
  if (position) return { node: position.offsetNode, offset: position.offset };

  const range = doc.caretRangeFromPoint?.(x, y);
  if (range) return { node: range.startContainer, offset: range.startOffset };

  return null;
}

function compareCaretPoints(a: CaretPoint, b: CaretPoint) {
  const first = document.createRange();
  first.setStart(a.node, a.offset);
  first.collapse(true);
  const second = document.createRange();
  second.setStart(b.node, b.offset);
  second.collapse(true);
  return first.compareBoundaryPoints(Range.START_TO_START, second);
}

function snapStartToWord(point: CaretPoint): CaretPoint {
  if (point.node.nodeType !== Node.TEXT_NODE) return point;
  const text = point.node.textContent ?? '';
  let offset = Math.min(point.offset, text.length);
  while (offset > 0 && !/\s/.test(text[offset - 1] ?? '')) offset -= 1;
  return { node: point.node, offset };
}

function snapEndToWord(point: CaretPoint): CaretPoint {
  if (point.node.nodeType !== Node.TEXT_NODE) return point;
  const text = point.node.textContent ?? '';
  let offset = Math.min(point.offset, text.length);
  while (offset < text.length && !/\s/.test(text[offset] ?? '')) offset += 1;
  return { node: point.node, offset };
}

function makeSnappedRange(start: CaretPoint, end: CaretPoint) {
  const isForward = compareCaretPoints(start, end) <= 0;
  const first = snapStartToWord(isForward ? start : end);
  const last = snapEndToWord(isForward ? end : start);
  const range = document.createRange();
  range.setStart(first.node, first.offset);
  range.setEnd(last.node, last.offset);
  return range;
}

function applyHighlight(editor: HTMLElement, range: Range, color: string) {
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
  const slices: Array<{ node: Text; start: number; end: number }> = [];
  let current = walker.nextNode();

  while (current) {
    const node = current as Text;
    if ((node.textContent ?? '').length && range.intersectsNode(node)) {
      let start = 0;
      let end = node.length;
      if (node === range.startContainer) start = range.startOffset;
      if (node === range.endContainer) end = range.endOffset;
      if (end > start) slices.push({ node, start, end });
    }
    current = walker.nextNode();
  }

  for (let index = slices.length - 1; index >= 0; index -= 1) {
    const { node, start, end } = slices[index];
    if (!node.parentNode) continue;

    if (end < node.length) node.splitText(end);
    const selected = start > 0 ? node.splitText(start) : node;
    const mark = document.createElement('span');
    mark.dataset.sermonHighlight = 'true';
    mark.style.backgroundColor = color;
    mark.style.borderRadius = '0.18em';
    mark.style.padding = '0 0.035em';
    selected.parentNode?.insertBefore(mark, selected);
    mark.appendChild(selected);
  }
}

export default function RichNoteEditor(props: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const dragStartRef = useRef<CaretPoint | null>(null);
  const highlightModeRef = useRef(false);
  const highlightColorRef = useRef('#F6E27A');
  const saveTimerRef = useRef<number | null>(null);

  const emitChange = () => {
    const editor = editorRef.current;
    if (!editor) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      void props.onContentChange(editor.innerHTML, editor.innerText.replace(/\u00a0/g, ' '));
    }, 70);
  };

  const saveSelection = () => {
    if (highlightModeRef.current) return;
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    savedRangeRef.current = range.cloneRange();
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus({ preventScroll: true });
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    if (savedRangeRef.current && editor.contains(savedRangeRef.current.commonAncestorContainer)) {
      selection.addRange(savedRangeRef.current);
      return;
    }
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.addRange(range);
    savedRangeRef.current = range.cloneRange();
  };

  const runCommand = (command: string, value?: string) => {
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    emitChange();
  };

  useDOMImperativeHandle(
    props.ref as never,
    (): RichNoteEditorRef => ({
      focus: () => editorRef.current?.focus(),
      bold: () => runCommand('bold'),
      italic: () => runCommand('italic'),
      underline: () => runCommand('underline'),
      bullets: () => runCommand('insertUnorderedList'),
      heading: () => runCommand('formatBlock', 'h2'),
      quote: () => runCommand('formatBlock', 'blockquote'),
      insertText: (...args: any[]) => {
        const text = typeof args[0] === 'string' ? args[0] : '';
        restoreSelection();
        document.execCommand('insertText', false, text);
        saveSelection();
        emitChange();
      },
      setHighlightMode: (...args: any[]) => {
        const enabled = Boolean(args[0]);
        const color = typeof args[1] === 'string' ? args[1] : highlightColorRef.current;
        highlightModeRef.current = enabled;
        highlightColorRef.current = color;
        const editor = editorRef.current;
        if (!editor) return;
        editor.classList.toggle('highlighting', enabled);
        editor.style.setProperty('--highlight-color', color);
        if (enabled) editor.blur();
      },
      setHighlightColor: (...args: any[]) => {
        const color = typeof args[0] === 'string' ? args[0] : highlightColorRef.current;
        highlightColorRef.current = color;
        editorRef.current?.style.setProperty('--highlight-color', color);
      },
    }),
    []
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.innerHTML = props.initialHtml;
    savedRangeRef.current = null;
  }, [props.sermonKey]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, []);

  const updatePreviewSelection = (point: CaretPoint) => {
    const editor = editorRef.current;
    const start = dragStartRef.current;
    if (!editor || !start || !editor.contains(point.node)) return null;
    const range = makeSnappedRange(start, point);
    const selection = window.getSelection();
    if (!selection) return null;
    selection.removeAllRanges();
    selection.addRange(range);
    return range;
  };

  const finishHighlight = (point: CaretPoint | null) => {
    const editor = editorRef.current;
    if (!editor || !dragStartRef.current) return;
    const range = point ? updatePreviewSelection(point) : null;
    if (range && !range.collapsed) {
      applyHighlight(editor, range, highlightColorRef.current);
      emitChange();
    }
    window.getSelection()?.removeAllRanges();
    dragStartRef.current = null;
  };

  return (
    <>
      <style>{`
        html, body, #root { margin: 0; width: 100%; height: 100%; background: transparent; overflow: hidden; }
        * { box-sizing: border-box; }
        .sermon-rich-editor {
          --highlight-color: #F6E27A;
          width: 100%;
          height: 100%;
          min-height: 100%;
          overflow-y: auto;
          outline: none;
          padding: 8px 2px 28px;
          color: ${props.textColor};
          background: transparent;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 18px;
          line-height: 29px;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          -webkit-overflow-scrolling: touch;
        }
        .sermon-rich-editor:empty::before {
          content: attr(data-placeholder);
          color: ${props.placeholderColor};
          pointer-events: none;
        }
        .sermon-rich-editor h2 { margin: 12px 0 6px; font-size: 24px; line-height: 31px; font-weight: 750; }
        .sermon-rich-editor blockquote { margin: 9px 0; padding-left: 12px; border-left: 3px solid ${props.placeholderColor}; opacity: 0.95; }
        .sermon-rich-editor ul { margin: 6px 0; padding-left: 26px; }
        .sermon-rich-editor.highlighting { cursor: crosshair; touch-action: none; }
        .sermon-rich-editor.highlighting::selection,
        .sermon-rich-editor.highlighting *::selection { background: var(--highlight-color); color: inherit; }
      `}</style>
      <div
        ref={editorRef}
        className="sermon-rich-editor"
        contentEditable
        suppressContentEditableWarning
        spellCheck
        data-placeholder="Start writing what stands out…"
        onInput={emitChange}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onTouchEnd={saveSelection}
        onFocus={saveSelection}
        onBlur={saveSelection}
        onPaste={(event) => {
          event.preventDefault();
          const text = event.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
          emitChange();
        }}
        onPointerDown={(event) => {
          if (!highlightModeRef.current) return;
          event.preventDefault();
          editorRef.current?.blur();
          const point = caretPointFromCoordinates(event.clientX, event.clientY);
          if (!point || !editorRef.current?.contains(point.node)) return;
          dragStartRef.current = point;
          event.currentTarget.setPointerCapture?.(event.pointerId);
          updatePreviewSelection(point);
        }}
        onPointerMove={(event) => {
          if (!highlightModeRef.current || !dragStartRef.current) return;
          event.preventDefault();
          const point = caretPointFromCoordinates(event.clientX, event.clientY);
          if (point) updatePreviewSelection(point);
        }}
        onPointerUp={(event) => {
          if (!highlightModeRef.current || !dragStartRef.current) return;
          event.preventDefault();
          const point = caretPointFromCoordinates(event.clientX, event.clientY);
          finishHighlight(point);
          event.currentTarget.releasePointerCapture?.(event.pointerId);
        }}
        onPointerCancel={() => finishHighlight(null)}
      />
    </>
  );
}
