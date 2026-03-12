// src/utils/redirect.js
export function getReturnTo(defaultPath = "/ebook/submit") {
  try {
    const saved = sessionStorage.getItem("returnTo");
    return saved || defaultPath;
  } catch {
    return defaultPath;
  }
}

export function setReturnTo(path) {
  try {
    sessionStorage.setItem("returnTo", path);
  } catch {}
}

export function clearReturnTo() {
  try {
    sessionStorage.removeItem("returnTo");
  } catch {}
}