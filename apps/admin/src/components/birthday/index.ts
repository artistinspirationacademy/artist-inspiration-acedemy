// Only the banner is exported on purpose: the celebration experience is
// code-split behind a dynamic import inside the banner, and re-exporting it
// here would pull it into the shared layout chunk.
export * from "./birthday-banner";
