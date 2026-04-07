(() => {
  const BASE_URL = "https://dabada.cloudish.cloud";
  const ROOT_ID = "dabada-ext-overlay-root";
  const URL_PATTERNS = {
    youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i,
    instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/.+/i,
  };

  function t(key, fallback) {
    try {
      const msg = chrome?.i18n?.getMessage?.(key);
      return msg || fallback;
    } catch {
      return fallback;
    }
  }

  function detectPlatform(url) {
    if (!url) return "auto";
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("instagram.com")) return "instagram";
    return "auto";
  }

  function isValidUrlForPlatform(url, platform) {
    if (!url) return false;
    if (platform === "youtube") return URL_PATTERNS.youtube.test(url);
    if (platform === "instagram") return URL_PATTERNS.instagram.test(url);
    // auto: accept if either platform matches
    return URL_PATTERNS.youtube.test(url) || URL_PATTERNS.instagram.test(url);
  }

  function ensureRoot() {
    let root = document.getElementById(ROOT_ID);
    if (root) return root;
    root = document.createElement("div");
    root.id = ROOT_ID;
    root.style.position = "fixed";
    root.style.inset = "0";
    root.style.zIndex = "2147483647";
    root.style.background = "rgba(0,0,0,0.12)";
    document.documentElement.appendChild(root);

    root.addEventListener("click", (e) => {
      if (e.target === root) close();
    });

    window.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Escape") close();
      },
      { passive: true }
    );

    return root;
  }

  function close() {
    const root = document.getElementById(ROOT_ID);
    if (root) root.remove();
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function render({ url }) {
    const root = ensureRoot();
    root.innerHTML = "";

    const card = document.createElement("div");
    card.style.width = "min(520px, calc(100vw - 32px))";
    card.style.borderRadius = "14px";
    card.style.background = "#0b0b0d";
    card.style.border = "1px solid rgba(255,255,255,0.10)";
    card.style.boxShadow =
      "0 20px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset";
    card.style.color = "#f3f4f6";
    card.style.fontFamily =
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
    card.style.padding = "14px";
    card.style.position = "fixed";
    card.style.top = "16px";
    card.style.right = "16px";
    card.style.left = "auto";
    card.style.userSelect = "none";

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "space-between";
    header.style.gap = "10px";
    header.style.cursor = "move";
    header.style.padding = "2px 0 8px";

    const titleWrap = document.createElement("div");
    const title = document.createElement("div");
    title.textContent = "DABADA";
    title.style.fontSize = "14px";
    title.style.fontWeight = "800";
    title.style.letterSpacing = "0.2px";
    const subtitle = document.createElement("div");
    subtitle.textContent = t("overlaySubtitle", "Minimal download panel");
    subtitle.style.fontSize = "12px";
    subtitle.style.color = "#9ca3af";
    subtitle.style.marginTop = "2px";
    titleWrap.appendChild(title);
    titleWrap.appendChild(subtitle);

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.style.border = "1px solid rgba(255,255,255,0.14)";
    closeBtn.style.background = "rgba(255,255,255,0.08)";
    closeBtn.style.color = "#e5e7eb";
    closeBtn.style.borderRadius = "10px";
    closeBtn.style.padding = "8px 10px";
    closeBtn.style.cursor = "pointer";
    closeBtn.addEventListener("click", close);

    header.appendChild(titleWrap);
    header.appendChild(closeBtn);

    const form = document.createElement("div");
    form.style.marginTop = "12px";
    form.style.display = "grid";
    form.style.gridTemplateColumns = "1fr";
    form.style.gap = "10px";

    const urlLabel = document.createElement("div");
    urlLabel.textContent = t("overlayUrlLabel", "URL");
    urlLabel.style.fontSize = "12px";
    urlLabel.style.color = "#cbd5e1";

    const urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.value = url || location.href;
    urlInput.placeholder = "https://...";
    urlInput.style.width = "100%";
    urlInput.style.boxSizing = "border-box";
    urlInput.style.background = "rgba(0,0,0,0.35)";
    urlInput.style.color = "#f3f4f6";
    urlInput.style.border = "1px solid rgba(255,255,255,0.12)";
    urlInput.style.borderRadius = "10px";
    urlInput.style.padding = "11px 12px";
    urlInput.style.fontSize = "12px";
    urlInput.style.outline = "none";

    const platformRow = document.createElement("div");
    platformRow.style.display = "flex";
    platformRow.style.alignItems = "center";
    platformRow.style.justifyContent = "space-between";
    platformRow.style.gap = "10px";

    const platformLabel = document.createElement("div");
    platformLabel.textContent = t("overlayPlatformLabel", "Platform");
    platformLabel.style.fontSize = "12px";
    platformLabel.style.color = "#cbd5e1";

    const platformSelect = document.createElement("select");
    platformSelect.style.flex = "0 0 160px";
    platformSelect.style.background = "rgba(0,0,0,0.35)";
    platformSelect.style.color = "#f3f4f6";
    platformSelect.style.border = "1px solid rgba(255,255,255,0.12)";
    platformSelect.style.borderRadius = "10px";
    platformSelect.style.padding = "10px 10px";
    platformSelect.style.fontSize = "12px";
    platformSelect.style.outline = "none";
    ["auto", "youtube", "instagram"].forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v === "auto" ? t("overlayPlatformAuto", "Auto") : v;
      platformSelect.appendChild(opt);
    });
    platformSelect.value = detectPlatform(urlInput.value);

    platformRow.appendChild(platformLabel);
    platformRow.appendChild(platformSelect);

    const status = document.createElement("div");
    status.style.fontSize = "12px";
    status.style.color = "#9ca3af";
    status.style.lineHeight = "1.35";
    status.textContent = t(
      "overlayStatusReady",
      "Click Download to start the browser download."
    );

    const persistRow = document.createElement("div");
    persistRow.style.display = "flex";
    persistRow.style.alignItems = "center";
    persistRow.style.gap = "8px";
    persistRow.style.marginTop = "2px";

    const persistDot = document.createElement("span");
    persistDot.style.width = "8px";
    persistDot.style.height = "8px";
    persistDot.style.borderRadius = "999px";
    persistDot.style.background = "#9ca3af";
    persistDot.style.boxShadow = "0 0 0 3px rgba(156,163,175,0.18)";

    const persistText = document.createElement("div");
    persistText.style.fontSize = "11px";
    persistText.style.color = "#cbd5e1";
    persistText.style.lineHeight = "1.35";
    persistText.textContent = t(
      "overlayPersistText",
      "Closing this popup won’t stop the download."
    );

    persistRow.appendChild(persistDot);
    persistRow.appendChild(persistText);

    const error = document.createElement("div");
    error.style.display = "none";
    error.style.fontSize = "12px";
    error.style.color = "#fecaca";
    error.style.lineHeight = "1.35";

    const btn = document.createElement("button");
    const DEFAULT_BTN_TEXT = t("overlayDownloadButton", "Download");
    btn.textContent = DEFAULT_BTN_TEXT;
    btn.style.width = "100%";
    btn.style.marginTop = "4px";
    btn.style.background = "#ffffff";
    btn.style.color = "#0b0b0d";
    btn.style.border = "none";
    btn.style.borderRadius = "12px";
    btn.style.padding = "12px 12px";
    btn.style.fontWeight = "900";
    btn.style.cursor = "pointer";

    let isBusy = false;

    const setError = (msg) => {
      if (!msg) {
        error.style.display = "none";
        error.textContent = "";
        return;
      }
      error.style.display = "block";
      error.textContent = msg;
    };

    const setBusy = (busy) => {
      isBusy = busy;
      btn.disabled = busy;
      btn.style.opacity = busy ? "0.7" : "1";
      btn.style.cursor = busy ? "not-allowed" : "pointer";
    };

    const setButtonValidity = (valid) => {
      if (isBusy) return; // don't override while busy
      btn.textContent = DEFAULT_BTN_TEXT;
      btn.disabled = !valid;
      btn.style.opacity = valid ? "1" : "0.55";
      btn.style.cursor = valid ? "pointer" : "not-allowed";
    };

    const getEffectivePlatform = (u) => {
      const p = platformSelect.value;
      if (p === "auto") return detectPlatform(u);
      return p;
    };

    const refreshValidity = () => {
      const u = urlInput.value.trim();
      const effective = getEffectivePlatform(u);
      const valid = isValidUrlForPlatform(u, effective === "auto" ? "auto" : effective);
      setButtonValidity(valid);
    };

    urlInput.addEventListener("input", () => {
      const detected = detectPlatform(urlInput.value);
      if (platformSelect.value === "auto") {
        // keep auto; no forced change
      } else if (detected !== "auto") {
        platformSelect.value = detected;
      }
      refreshValidity();
    });
    platformSelect.addEventListener("change", refreshValidity);
    refreshValidity();

    btn.addEventListener("click", async () => {
      setError("");
      const targetUrl = urlInput.value.trim();
      if (!targetUrl) {
        setError(t("overlayErrorUrlRequired", "URL is required."));
        return;
      }
      let platform = platformSelect.value;
      if (platform === "auto") {
        platform = detectPlatform(targetUrl);
      }
      if (platform !== "youtube" && platform !== "instagram") {
        setError(t("overlayErrorUnsupportedUrl", "Unsupported URL. (YouTube/Instagram)"));
        return;
      }

      setBusy(true);
      status.textContent = t("overlayStatusRequesting", "Requesting…");
      persistDot.style.background = "#f59e0b";
      persistDot.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.22)";
      try {
        const res = await chrome.runtime.sendMessage({
          type: "DABADA_REQUEST_DOWNLOAD",
          url: targetUrl,
          platform,
        });
        if (!res?.success) {
          setError(res?.error || t("overlayErrorRequestFailed", "Download request failed."));
          status.textContent = t("overlayStatusFailed", "Failed");
          persistDot.style.background = "#ef4444";
          persistDot.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.22)";
          return;
        }
        status.textContent = t(
          "overlayStatusStarted",
          "Download started (check Chrome downloads)"
        );
        persistDot.style.background = "#22c55e";
        persistDot.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.22)";
        // keep overlay open so user can see status; close on success after short delay
        setTimeout(close, 600);
      } catch (e) {
        setError(t("overlayErrorCommunication", "Extension communication error."));
        status.textContent = t("overlayStatusFailed", "Failed");
        persistDot.style.background = "#ef4444";
        persistDot.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.22)";
      } finally {
        setBusy(false);
        refreshValidity();
      }
    });

    form.appendChild(urlLabel);
    form.appendChild(urlInput);
    form.appendChild(platformRow);
    form.appendChild(btn);
    form.appendChild(status);
    form.appendChild(persistRow);
    form.appendChild(error);

    card.appendChild(header);
    card.appendChild(form);
    root.appendChild(card);

    // Make draggable within viewport
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    const syncInitialLeftTop = () => {
      const rect = card.getBoundingClientRect();
      const left = rect.left;
      const top = rect.top;
      card.style.left = `${left}px`;
      card.style.top = `${top}px`;
      card.style.right = "auto";
    };

    // Convert initial top/right to explicit left/top for dragging.
    requestAnimationFrame(syncInitialLeftTop);

    const onMove = (clientX, clientY) => {
      const rect = card.getBoundingClientRect();
      const maxLeft = window.innerWidth - rect.width - 8;
      const maxTop = window.innerHeight - rect.height - 8;
      const nextLeft = clamp(startLeft + (clientX - startX), 8, maxLeft);
      const nextTop = clamp(startTop + (clientY - startY), 8, maxTop);
      card.style.left = `${nextLeft}px`;
      card.style.top = `${nextTop}px`;
    };

    const onMouseMove = (e) => {
      if (!dragging) return;
      onMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      dragging = false;
      document.removeEventListener("mousemove", onMouseMove, true);
      document.removeEventListener("mouseup", onMouseUp, true);
    };

    header.addEventListener("mousedown", (e) => {
      // Don't start drag when clicking the close button.
      if (e.target === closeBtn) return;
      syncInitialLeftTop();
      const rect = card.getBoundingClientRect();
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      document.addEventListener("mousemove", onMouseMove, true);
      document.addEventListener("mouseup", onMouseUp, true);
      e.preventDefault();
    });
  }

  // Public entry point via message
  chrome.runtime.onMessage.addListener((msg) => {
    if (!msg || msg.type !== "DABADA_OPEN_OVERLAY") return;
    render({ url: msg.url });
  });

  // If executed with a global flag, auto-open once
  if (window.__DABADA_OVERLAY_AUTO_OPEN__) {
    // eslint-disable-next-line no-undef
    render({ url: window.__DABADA_OVERLAY_URL__ || location.href });
    // eslint-disable-next-line no-undef
    window.__DABADA_OVERLAY_AUTO_OPEN__ = false;
  }
})();

