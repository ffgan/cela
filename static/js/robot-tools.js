function encodeBase64() {
  const input = document.querySelector('.tool-section:nth-of-type(1) .input-group:nth-of-type(1) input');
  const output = document.querySelector('.tool-section:nth-of-type(1) .input-group:nth-of-type(2) input');
  if (!input || !output) {
    console.error('Input or output field not found.');
    return;
  }

  const text = input.value;

  if (text.trim() === '') {
    alert('Please enter text to encode.');
    return;
  }

  try {
    output.value = btoa(text);
  } catch (error) {
    alert('Error encoding text: ' + error.message);
  }
}

function decodeBase64() {
  const input = document.querySelector('.tool-section:nth-of-type(1) .input-group:nth-of-type(2) input');
  const output = document.querySelector('.tool-section:nth-of-type(1) .input-group:nth-of-type(1) input');

  if (!input || !output) {
    console.error('Input or output field not found.');
    return;
  }

  const text = input.value;

  if (text.trim() === '') {
    alert('Please enter Base64 encoded text to decode.');
    return;
  }

  try {
    output.value = atob(text);
  } catch (error) {
    alert('Error decoding text: ' + error.message);
  }
}

function generateMD5() {
  const input = document.querySelector('.tool-section:nth-of-type(2) .input-group:nth-of-type(1) input');
  const output = document.querySelector('.tool-section:nth-of-type(2) .input-group:nth-of-type(2) input');

  if (!input || !output) {
    console.error('Input or output field not found.');
    return;
  }

  const text = input.value;

  if (text.trim() === '') {
    alert('Please enter text to hash.');
    return;
  }

  try {
    output.value = CryptoJS.MD5(text).toString();
  } catch (error) {
    alert('Error generating MD5 hash: ' + error.message);
  }
}
