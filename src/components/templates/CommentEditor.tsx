"use client";

import { useEffect, useState } from "react";
import type { TemplateComment } from "../../types/template";

interface CommentEditorProps {
  comment: TemplateComment;
  onChange: (comment: TemplateComment) => void;
}

function htmlToText(html: string): string {
  if (!html) {
    return "";
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(
    html,
    "text/html"
  );

  document
    .querySelectorAll("br")
    .forEach((element) => {
      element.replaceWith("\n");
    });

  document
    .querySelectorAll("p, div, li")
    .forEach((element) => {
      element.insertAdjacentText("beforebegin", "\n");
    });

  return (
    document.body.textContent
      ?.replace(/\n{3,}/g, "\n\n")
      .trim() ?? ""
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function textToHtml(text: string): string {
  const escaped = escapeHtml(text);

  const paragraphs = escaped
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return "";
  }

  return paragraphs
    .map(
      (paragraph) =>
        `<p>${paragraph.replace(/\n/g, "<br>")}</p>`
    )
    .join("");
}

export default function CommentEditor({
  comment,
  onChange,
}: CommentEditorProps) {
  const [value, setValue] = useState(
    htmlToText(comment.contentHtml)
  );

  useEffect(() => {
    setValue(htmlToText(comment.contentHtml));
  }, [comment.id]);

  function handleChange(
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const text = event.target.value;

    setValue(text);

    onChange({
      ...comment,
      contentHtml: textToHtml(text),
    });
  }

  return (
    <div className="rounded-md border bg-white p-4">
      <label
        htmlFor={`comment-${comment.id}`}
        className="block text-sm font-medium"
      >
        Comment
      </label>

      <textarea
        id={`comment-${comment.id}`}
        value={value}
        onChange={handleChange}
        rows={5}
        className="mt-2 w-full resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
      />
    </div>
  );
}