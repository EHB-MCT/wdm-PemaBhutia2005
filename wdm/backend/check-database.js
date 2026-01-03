const db = require('./config/database');

console.log("Checking current database state...");

db.serialize(() => {
    db.all("SELECT name, email, is_admin FROM users", (err, users) => {
        if (err) {
            console.error("Error:", err);
            return;
        }
        console.log("Current users:", users);
        console.log(`Total users: ${users.length}`);
        
        db.all("SELECT COUNT(*) as item_count FROM clothing_items", (err, items) => {
            if (err) {
                console.error("Error:", err);
                return;
            }
            console.log(`Total clothing items: ${items[0].item_count}`);
            
            db.all("SELECT COUNT(*) as outfit_count FROM outfits", (err, outfits) => {
                if (err) {
                    console.error("Error:", err);
                    return;
                }
                console.log(`Total outfits: ${outfits[0].outfit_count}`);
                
                db.close();
            });
        });
    });
});