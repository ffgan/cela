/* Robot page tools — Base64 + SHA-256 via Web APIs (no crypto-js). */

function encodeBase64() {
  const input = document.querySelector(
    ".tool-section:nth-of-type(1) .input-group:nth-of-type(1) input",
  );
  const output = document.querySelector(
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
    output.value = btoa(unescape(encodeURIComponent(text)));
  } catch (error) {
    alert("Error encoding text: " + error.message);
  }
}

function decodeBase64() {
  const input = document.querySelector(
    ".tool-section:nth-of-type(1) .input-group:nth-of-type(2) input",
  );
  const output = document.querySelector(
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
    output.value = decodeURIComponent(escape(atob(text)));
  } catch (error) {
    alert("Error decoding text: " + error.message);
  }
}

function bytesToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(function (b) {
      return b.toString(16).padStart(2, "0");
    })
    .join("");
}

async function generateSHA256() {
  const input = document.querySelector(
    ".tool-section:nth-of-type(2) .input-group:nth-of-type(1) input",
  );
  const output = document.querySelector(
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

  if (!window.crypto || !window.crypto.subtle) {
    alert("Web Crypto is unavailable in this browser context.");
    return;
  }

  try {
    const data = new TextEncoder().encode(text);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    output.value = bytesToHex(digest);
  } catch (error) {
    alert("Error generating SHA-256 hash: " + error.message);
  }
}

// Keep legacy name used by older bookmarks / cached HTML if any.
function generateMD5() {
  return generateSHA256();
}
