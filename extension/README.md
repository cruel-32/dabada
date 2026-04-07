# DABADA Chrome Extension

## What it does

- Adds a context menu item **"DABADA로 다운로드하기"** on YouTube/Instagram pages.
- Adds a toolbar popup that can open the DABADA web app with the **current tab URL** prefilled.

The actual download flow and cooldown are handled by the web app (`https://dabada.cloudish.cloud`).

## Local install (for testing)

1. Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder: `dabada/extension`

## How to use

- On a YouTube/Instagram page: right-click → **DABADA로 다운로드하기**
- Or click the extension icon → **DABADA에서 열기**

## Build the zip for Chrome Web Store

From repo root:

```bash
pnpm extension:zip
```

Output:

- `dist/dabada-extension.zip`

## Notes (store review)

- The extension itself does not fetch media or inject scripts; it only opens DABADA with a URL.
- You still must comply with Chrome Web Store policies on copyrighted media downloading.

