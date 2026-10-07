import { decodeUtf8Base64, encodeUtf8Base64 } from "./lib/base64";
import { onReady } from "./lib/dom";

declare global {
  interface Window {
    encodeBase64: () => void;
    decodeBase64: () => void;
    generateSHA256: () => Promise<void>;
    generateMD5: () => Promise<void>;
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function inputByRole(tool: string, role: string, legacySelector: string): HTMLInputElement | null {
  const modern = document.querySelector(`[data-tool="${tool}"] [data-role="${role}"]`);
  if (modern instanceof HTMLInputElement) {
    return modern;
  }
  const legacy = document.querySelector(legacySelector);
  return legacy instanceof HTMLInputElement ? legacy : null;
}

function encodeBase64(): void {
  const input = inputByRole(
    "base64",
    "plain",
    ".tool-section:nth-of-type(1) .input-group:nth-of-type(1) input",
  );
  const output = inputByRole(
    "base64",
    "encoded",
    ".tool-section:nth-of-type(1) .input-group:nth-of-type(2) input",
  );
  if (!input || !output) {
    console.error("Input or output field not found.");
    return;
  }

  const text = input.value;
  if (text.trim() === "") {
    alert("Please enter text to encode.");
    return;
  }

  try {
    output.value = encodeUtf8Base64(text);
  } catch (error) {
    alert(`Error encoding text: ${errorMessage(error)}`);
  }
}

function decodeBase64(): void {
  const input = inputByRole(
    "base64",
    "encoded",
    ".tool-section:nth-of-type(1) .input-group:nth-of-type(2) input",
  );
  const output = inputByRole(
    "base64",
    "plain",
    ".tool-section:nth-of-type(1) .input-group:nth-of-type(1) input",
  );

  if (!input || !output) {
    console.error("Input or output field not found.");
    return;
  }

  const text = input.value;
  if (text.trim() === "") {
    alert("Please enter Base64 encoded text to decode.");
    return;
  }

  try {
    output.value = decodeUtf8Base64(text);
  } catch (error) {
    alert(`Error decoding text: ${errorMessage(error)}`);
  }
}

function bytesToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function generateSHA256(): Promise<void> {
  const input = inputByRole(
    "sha256",
    "plain",
    ".tool-section:nth-of-type(2) .input-group:nth-of-type(1) input",
  );
  const output = inputByRole(
    "sha256",
    "digest",
    ".tool-section:nth-of-type(2) .input-group:nth-of-type(2) input",
  );

  if (!input || !output) {
    console.error("Input or output field not found.");
    return;
  }

  const text = input.value;
  if (text.trim() === "") {
    alert("Please enter text to hash.");
    return;
  }

  if (!window.crypto?.subtle) {
    alert("Web Crypto is unavailable in this browser context.");
    return;
  }

  try {
    const data = new TextEncoder().encode(text);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    output.value = bytesToHex(digest);
  } catch (error) {
    alert(`Error generating SHA-256 hash: ${errorMessage(error)}`);
  }
}

function bindAction(action: string, handler: () => void): void {
  document.querySelectorAll(`[data-action="${action}"]`).forEach((button) => {
    button.addEventListener("click", handler);
  });
}

function installRobotTools(): void {
  window.encodeBase64 = encodeBase64;
  window.decodeBase64 = decodeBase64;
  window.generateSHA256 = generateSHA256;
  window.generateMD5 = generateSHA256;
  bindAction("encode", encodeBase64);
  bindAction("decode", decodeBase64);
  bindAction("hash", () => {
    void generateSHA256();
  });
}

onReady(installRobotTools);
