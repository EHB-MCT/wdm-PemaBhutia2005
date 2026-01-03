const path = require('path');
console.log("Database path from config:", path.join(__dirname, 'config', 'database.js').replace(/\\/g, '/'));
console.log("Resolved database path would be:", path.join(__dirname, '..', 'database.sqlite').replace(/\\/g, '/'));
console.log("Backend database exists:", require('fs').existsSync(path.join(__dirname, 'database.sqlite')));
console.log("WDM database exists:", require('fs').existsSync(path.join(__dirname, '..', 'database.sqlite')));