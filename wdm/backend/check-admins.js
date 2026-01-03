const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database.sqlite');

console.log("Checking admin users and database structure...");

db.serialize(() => {
    db.all("SELECT name, email, is_admin FROM users WHERE is_admin = 1", (err, admins) => {
        if (err) {
            console.error("Error:", err);
            return;
        }
        console.log("\n👑 ADMIN USERS:");
        if (admins.length === 0) {
            console.log("❌ No admin users found!");
        } else {
            admins.forEach(admin => {
                console.log(`✅ ${admin.name} (${admin.email}) - Admin: ${admin.is_admin}`);
            });
        }
        
        db.all("SELECT email FROM users", (err, allUsers) => {
            if (err) {
                console.error("Error:", err);
                return;
            }
            console.log(`\n📋 All users (${allUsers.length}):`);
            allUsers.forEach((user, i) => {
                console.log(`${i+1}. ${user.email}`);
            });
            
            db.close();
        });
    });
});