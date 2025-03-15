const express = require('express');
const path = require('path');
const app = express();

// Désactiver la mise en cache
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Serve static files from the correct directory
app.use(express.static(path.join(__dirname, 'dist/KARANGUE_TRAFIC/browser/browser')));

// Serve the index.html file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/KARANGUE_TRAFIC/browser/browser/index.html'));
});

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
