// Simple test to check if modules load
console.log('main.tsx loaded successfully!')

// Simple DOM manipulation
const root = document.getElementById('root')
if (root) {
  root.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: #2563eb;">Велес Склад - Современная версия</h1>
      <p style="color: #374151;">JavaScript модули загружаются корректно!</p>
      <p style="color: #059669;">✅ MIME type исправлен</p>
      <p style="color: #059669;">✅ ES модули работают</p>
      <p style="color: #059669;">✅ Vite сервер функционирует</p>
    </div>
  `
}