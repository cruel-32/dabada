const BASE_URL = "https://dabada.cloudish.cloud";

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

async function ensureOverlayInjected(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["injected_overlay.js"],
  });
}

async function openOverlayOnTab(tabId, pageUrl) {
  await ensureOverlayInjected(tabId);
  await chrome.tabs.sendMessage(tabId, { type: "DABADA_OPEN_OVERLAY", url: pageUrl });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "dabada-download",
    title: chrome.i18n.getMessage("contextMenuTitle"),
    contexts: ["page", "link", "video", "audio"],
    documentUrlPatterns: ["*://*.youtube.com/*", "*://youtu.be/*", "*://*.instagram.com/*"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "dabada-download") return;
  if (!tab?.id) return;
  const pageUrl = info.pageUrl || info.linkUrl;
  await openOverlayOnTab(tab.id, pageUrl);
});

function cooldownRemainingSeconds(cooldownUntilIso) {
  try {
    if (!cooldownUntilIso) return null;
    const until = new Date(cooldownUntilIso).getTime();
    const now = Date.now();
    return Math.max(0, Math.ceil((until - now) / 1000));
  } catch {
    return null;
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== "DABADA_REQUEST_DOWNLOAD") return;

  (async () => {
    try {
      const url = message.url;
      const platform = message.platform;

      const resp = await fetch(`${BASE_URL}/api/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, platform }),
      });
      const data = await resp.json().catch(() => ({}));

      if (!resp.ok || !data?.success) {
        const remaining = cooldownRemainingSeconds(data?.cooldownUntil);
        const err =
          remaining != null && remaining > 0
            ? `쿨타임이 적용 중입니다. ${remaining}초 후 다시 시도해주세요.`
            : data?.error || "Download request failed";
        sendResponse({ success: false, error: err, cooldownUntil: data?.cooldownUntil });
        return;
      }

      const downloadUrl = data.downloadUrl;
      if (!downloadUrl || typeof downloadUrl !== "string") {
        sendResponse({ success: false, error: "Invalid download URL" });
        return;
      }

      const absolute = downloadUrl.startsWith("http")
        ? downloadUrl
        : `${BASE_URL}${downloadUrl}`;

      const downloadId = await chrome.downloads.download({
        url: absolute,
        conflictAction: "uniquify",
        saveAs: false,
      });

      sendResponse({ success: true, downloadId });
    } catch (e) {
      sendResponse({ success: false, error: e instanceof Error ? e.message : "Network error" });
    }
  })();

  return true;
});

