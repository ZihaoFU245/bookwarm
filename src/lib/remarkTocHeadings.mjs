import { slug as slugify } from "github-slugger";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";

const TOC_MARKER = /^\s*(?:\[toc\]|\[\[toc\]\]|\[\[_toc_\]\])\s*$/i;
const TOC_HEADING = /^table of contents?$/i;
const HEADING_ID = /\s*\{#([A-Za-z0-9_-]+)\}\s*$/;

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const extractHeadingId = (node) => {
  const lastChild = node.children.at(-1);
  if (!lastChild || lastChild.type !== "text") return undefined;

  const match = lastChild.value.match(HEADING_ID);
  if (!match) return undefined;

  lastChild.value = lastChild.value.replace(HEADING_ID, "");
  if (!lastChild.value.trim()) {
    node.children.pop();
  }

  return match[1];
};

const buildTocHtml = (headings) => {
  if (!headings.length) return "";

  const items = headings
    .map(({ depth, text, id }) => {
      const indent = Math.max(0, depth - 2) * 1.25;
      return `<li style="margin-left:${indent}rem"><a href="#${escapeHtml(id)}">${escapeHtml(text)}</a></li>`;
    })
    .join("");

  return `<nav aria-label="Table of contents" class="toc"><ul>${items}</ul></nav>`;
};

export default function remarkTocHeadings() {
  return (tree) => {
    const headings = [];
    const insertions = [];

    visit(tree, "heading", (node, index, parent) => {
      const text = toString(node).trim();
      const customId = extractHeadingId(node);
      const cleanText = toString(node).trim();
      const id = customId || slugify(cleanText);

      node.data ||= {};
      node.data.hProperties ||= {};
      node.data.id = id;
      node.data.hProperties.id = id;

      if (!parent || index === undefined) return;
      if (TOC_HEADING.test(cleanText)) {
        insertions.push({ parent, index: index + 1, mode: "after-heading" });
        return;
      }

      if (node.depth >= 2 && cleanText) {
        headings.push({ depth: node.depth, text: cleanText, id });
      }
    });

    visit(tree, "paragraph", (node, index, parent) => {
      if (!parent || index === undefined) return;
      if (!TOC_MARKER.test(toString(node))) return;
      insertions.push({ parent, index, mode: "replace-marker" });
    });

    const tocHtml = buildTocHtml(
      headings.filter(({ text }) => !TOC_HEADING.test(text)),
    );
    if (!tocHtml) return;

    insertions
      .sort((a, b) => b.index - a.index)
      .forEach(({ parent, index, mode }) => {
        const htmlNode = { type: "html", value: tocHtml };
        if (mode === "replace-marker") {
          parent.children.splice(index, 1, htmlNode);
          return;
        }

        parent.children.splice(index, 0, htmlNode);
      });
  };
}
