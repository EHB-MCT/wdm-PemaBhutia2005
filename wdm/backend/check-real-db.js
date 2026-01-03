const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database.sqlite');

console.log("Checking actual database at wdm/database.sqlite...");

db.serialize(() => {
    db.all("SELECT name, email, is_admin FROM users", (err, users) => {
        if (err) {
            console.error("Error:", err);
            return;
        }
        console.log("Users in wdm/database.sqlite:", users.length);
        if (users.length > 0) {
            console.log("Sample users:", users.slice(0, 3));
        }
        
        db.get("SELECT COUNT(*) as count FROM clothing_items", (err, result) => {
            if (err) {
                console.error("Error:", err);
                return;
            }
            console.log("Clothing items:", result.count);
            
            db.get("SELECT COUNT(*) as count FROM outfits", (err, result) => {
                if (err) {
                    console.error("Error:", err);
                    return;
                }
                console.log("Outfits:", result.count);
                db.close();
            });
        });
    });
});