export function cleanHtml(html = "") {
  return html
    .replace(/<p>/gi, "")
    .replace(/<\/p>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .trim();
}
