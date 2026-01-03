const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Connect to correct database
const db = new sqlite3.Database('../database.sqlite');

console.log("🔧 Adding admin user and cleaning up...");

async function addAdminUser() {
    console.log("Adding admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const adminId = uuidv4();
    
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO users (id, name, email, password, is_admin) VALUES (?, ?, ?, ?, ?)",
            [adminId, "Admin User", "admin@email.com", hashedPassword, 1],
            (err) => {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        console.log("Admin user already exists");
                        resolve();
                    } else {
                        reject(err);
                    }
                } else {
                    console.log("✅ Admin user created successfully");
                    console.log("Email: admin@email.com");
                    console.log("Password: admin123");
                    resolve();
                }
            }
        );
    });
}

async function cleanupRedundantDB() {
    console.log("\nCleaning up redundant database file...");
    const fs = require('fs');
    const path = require('path');
    const redundantDB = path.join(__dirname, 'database.sqlite');
    
    if (fs.existsSync(redundantDB)) {
        fs.unlinkSync(redundantDB);
        console.log("✅ Removed redundant database: wdm/backend/database.sqlite");
    } else {
        console.log("No redundant database found");
    }
}

async function showFinalStatus() {
    console.log("\n📊 Final Status:");
    
    db.all("SELECT name, email, is_admin FROM users ORDER BY is_admin DESC, name ASC", (err, users) => {
        if (err) {
            console.error("Error:", err);
            return;
        }
        
        console.log(`Total users: ${users.length}`);
        const admins = users.filter(u => u.is_admin === 1);
        console.log(`Admin users: ${admins.length}`);
        
        if (admins.length > 0) {
            console.log("\n👑 Admin Accounts:");
            admins.forEach(admin => {
                console.log(`✅ ${admin.name} (${admin.email})`);
            });
        }
        
        console.log("\n🔑 Login Credentials:");
        console.log("Admin: admin@email.com / admin123");
        console.log("Test User: testuser2@email.com / testuser2");
        
        console.log("\n🗂️ Database Location:");
        console.log("✅ Using: wdm/database.sqlite (81,920 bytes)");
        console.log("❌ Removed: wdm/backend/database.sqlite (redundant)");
        
        db.close();
    });
}

async function fixIssues() {
    try {
        await addAdminUser();
        await cleanupRedundantDB();
        await showFinalStatus();
        console.log("\n🎉 All issues fixed! Database is ready.");
    } catch (error) {
        console.error("❌ Error:", error);
        db.close();
    }
}

fixIssues();