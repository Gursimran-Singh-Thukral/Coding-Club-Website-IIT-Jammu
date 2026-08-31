// Builds the HTML document rendered inside the sandboxed preview iframe
// (`sandbox="allow-scripts"`, deliberately no `allow-same-origin` - the
// iframe gets an opaque origin, so even if student JS tries to read
// cookies/localStorage or fetch the app's API, it can't carry this site's
// session). The CSP below is a second layer inside that document itself:
// no network access, no external scripts/frames/plugins - the only things
// allowed to run are the inline <style>/<script> blocks the student wrote.

const PREVIEW_CSP =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: https:; font-src data: https:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none';";

export function buildSandboxedPreview(code: { html: string; css: string; js: string }) {
  return `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}"><style>${code.css}</style></head><body>${code.html}<script>${code.js}<\/script></body></html>`;
}
