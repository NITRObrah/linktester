// ------------------------------------------------------------
//  Link‑Tester – frontend only (detects 403/451/503 + blocked text)
// ------------------------------------------------------------
async function test() {
  const url = document.getElementById('url').value;
  const district = document.getElementById('district').value;
  const blocker = document.getElementById('blocker').value;
  const resultEl = document.getElementById('result');

  resultEl.textContent = 'Testing…\n';
  resultEl.classList.remove('hidden');

  try {
    const start = Date.now();

    // 1️⃣ fetch the page – we use a proxy that returns the country IP
    // (You can replace this with a real public proxy later if you want)
    const resp = await fetch(url, {method: 'GET',
                                 timeout: 15000});   // 15 s timeout

    const elapsed = Date.now() - start;
    resultEl.textContent += `Status: \${resp.status}\n`;
    resultEl.textContent += `Time: \${elapsed} ms\n`;

    // 2️⃣ decide if it looks blocked
    let blocked = false;
    const blockedCodes = [403, 451, 503];
    if (blockedCodes.includes(resp.status)) blocked = true;
    else {
      const body = await resp.text();
      const bodySnippet = body.slice(0, 300).toLowerCase();
      // common “blocked” phrases
      const blockedWords = ['blocked', 'forbidden', 'access denied', 'error', 'censored'];
      blocked = blockedWords.some(w => bodySnippet.includes(w));
    }

    resultEl.textContent += `Blocked? \${blocked ? 'YES' : 'NO'}\n`;
    // Show first 300 chars of response (sanitized)
    resultEl.textContent += '\n--- Body (first 300 chars) ---\n';
    resultEl.textContent += body.slice(0,300).replace(/</g,'<').replace(/>/g,'>');

  } catch (e) {
    resultEl.textContent = 'Error: ' + e;
  } finally {
    resultEl.classList.add('hidden');
  }
}

document.getElementById('testBtn').onclick = test;
