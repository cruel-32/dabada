const BASE_URL = "https://dabada.cloudish.cloud";

function i18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const msg = key ? chrome.i18n.getMessage(key) : "";
    if (msg) el.textContent = msg;
  });
}

function getLocalePath() {
  const lang = chrome.i18n.getUILanguage?.() || "en";
  return lang.toLowerCase().startsWith("ko") ? "ko" : "en";
}

function detectPlatform(url) {
  if (!url) return undefined;
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("instagram.com")) return "instagram";
  return undefined;
}

function buildTargetUrl(pageUrl, platformSelectValue) {
  const locale = getLocalePath();
  const u = new URL(`${BASE_URL}/${locale}`);
  if (pageUrl) u.searchParams.set("url", pageUrl);

  const detected = detectPlatform(pageUrl);
  const platform =
    platformSelectValue && platformSelectValue !== "auto"
      ? platformSelectValue
      : detected;
  if (platform) u.searchParams.set("platform", platform);

  u.searchParams.set("source", "extension");
  return u.toString();
}

async function getActiveTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url || "";
}

async function openOverlayOnActiveTab(pageUrl) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["injected_overlay.js"],
  });
  await chrome.tabs.sendMessage(tab.id, { type: "DABADA_OPEN_OVERLAY", url: pageUrl });
}

function setError(msg) {
  const el = document.getElementById("error");
  if (!el) return;
  if (!msg) {
    el.style.display = "none";
    el.textContent = "";
    return;
  }
  el.style.display = "block";
  el.textContent = msg;
}

document.addEventListener("DOMContentLoaded", async () => {
  i18n();

  const urlInput = document.getElementById("url");
  const platformSelect = document.getElementById("platform");
  const openBtn = document.getElementById("open");
  const openHomeBtn = document.getElementById("openHome");

  try {
    const url = await getActiveTabUrl();
    if (urlInput) urlInput.value = url;

    const detected = detectPlatform(url);
    if (platformSelect && detected) platformSelect.value = detected;
  } catch (e) {
    setError(
      chrome.i18n.getMessage("popupErrorCannotReadTab") ||
        "Cannot read current tab."
    );
  }

  openBtn?.addEventListener("click", async () => {
    setError("");
    const pageUrl = urlInput?.value?.trim() || "";
    if (!pageUrl) {
      setError(
        chrome.i18n.getMessage("popupErrorUrlRequired") || "URL is required."
      );
      return;
    }
    await openOverlayOnActiveTab(pageUrl);
    window.close();
  });

  openHomeBtn?.addEventListener("click", async () => {
    setError("");
    await openOverlayOnActiveTab(await getActiveTabUrl());
    window.close();
  });
});

