const QRCode = require('qrcode');
QRCode.toDataURL('', { margin: 1, width: 150 })
  .then(console.log)
  .catch(err => console.error("Error:", err.message));
