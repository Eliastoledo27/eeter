const key = 'AIzaSyB_bH7VwEOxBf0s--nI3A5pt1iFXqLGL2c';
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + key, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: 'Hola' }] }],
    systemInstruction: { parts: [{ text: 'Sos un asistente amigable.' }] },
    generationConfig: { temperature: 0.8 }
  })
}).then(async r => {
  console.log('Status:', r.status);
  const data = await r.json();
  console.log('Data:', JSON.stringify(data, null, 2));
}).catch(console.error);
