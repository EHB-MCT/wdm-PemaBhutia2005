const db = require('./config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Clear all data first
async function clearAllData() {
    console.log("Clearing ALL data from database...");
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("DELETE FROM outfits", (err) => {
                if (err) return reject(err);
                db.run("DELETE FROM clothing_items", (err) => {
                    if (err) return reject(err);
                    db.run("DELETE FROM users", (err) => {
                        if (err) return reject(err);
                        console.log("All data cleared successfully");
                        resolve();
                    });
                });
            });
        });
    });
}

// Users with clear economic categories
const users = [
    // High Net Worth
    { name: "Victoria Sterling", email: "victoria.s@email.com", password: "password123", status: "high" },
    { name: "Alexander Morgan", email: "alexander.m@email.com", password: "password123", status: "high" },
    { name: "Isabella Laurent", email: "isabella.l@email.com", password: "password123", status: "high" },
    
    // Upper Middle Class  
    { name: "Jessica Parker", email: "jessica.p@email.com", password: "password123", status: "upper-middle" },
    { name: "Michael Robinson", email: "michael.r@email.com", password: "password123", status: "upper-middle" },
    { name: "Amanda Foster", email: "amanda.f@email.com", password: "password123", status: "upper-middle" },
    { name: "Daniel Chen", email: "daniel.c@email.com", password: "password123", status: "upper-middle" },
    
    // Middle Class
    { name: "Sarah Williams", email: "sarah.w@email.com", password: "password123", status: "middle" },
    { name: "Robert Johnson", email: "robert.j@email.com", password: "password123", status: "middle" },
    { name: "Emily Davis", email: "emily.d@email.com", password: "password123", status: "middle" },
    { name: "James Wilson", email: "james.w@email.com", password: "password123", status: "middle" },
    { name: "Lisa Thompson", email: "lisa.t@email.com", password: "password123", status: "middle" },
    { name: "David Martinez", email: "david.m@email.com", password: "password123", status: "middle" },
    
    // Budget Conscious
    { name: "Jennifer Brown", email: "jennifer.b@email.com", password: "password123", status: "budget" },
    { name: "Christopher Lee", email: "chris.l@email.com", password: "password123", status: "budget" },
    { name: "Michelle Garcia", email: "michelle.g@email.com", password: "password123", status: "budget" },
    
    // Test User
    { name: "Test User 2", email: "testuser2@email.com", password: "testuser2", status: "middle" }
];

// Clothing items per user based on status
const clothingConfig = {
    high: { items: 12, brands: ["Gucci", "Prada", "Balenciaga", "Saint Laurent", "Bottega Veneta"], priceRange: [800, 3000] },
    "upper-middle": { items: 10, brands: ["Ralph Lauren", "J.Crew", "Banana Republic", "Coach", "Michael Kors"], priceRange: [150, 600] },
    middle: { items: 8, brands: ["Nike", "Levi's", "Zara", "H&M", "Gap", "Adidas"], priceRange: [40, 200] },
    budget: { items: 5, brands: ["Uniqlo", "Old Navy", "Target", "Forever 21", "H&M"], priceRange: [15, 80] }
};

const categories = ["tops", "bottoms", "shoes", "jackets", "sweaters", "accessories"];
const seasons = ["Spring", "Summer", "Fall", "Winter"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

// Real EXIF data samples
const exifSamples = [
    { lat: 40.7589, lon: -73.9851, alt: 15.5, datetime: "2024-06-15T14:30:00.000Z", make: "Apple", model: "iPhone 15 Pro" },
    { lat: 34.0522, lon: -118.2437, alt: 120.3, datetime: "2024-07-22T16:45:00.000Z", make: "Samsung", model: "Galaxy S24" },
    { lat: 51.5074, lon: -0.1278, alt: 25.1, datetime: "2024-05-10T11:20:00.000Z", make: "Google", model: "Pixel 8 Pro" },
    { lat: 48.8566, lon: 2.3522, alt: 35.7, datetime: "2024-08-03T18:15:00.000Z", make: "Apple", model: "iPhone 14" },
    { lat: 35.6762, lon: 139.6503, alt: 42.2, datetime: "2024-09-12T13:00:00.000Z", make: "Sony", model: "Xperia 1 V" }
];

// Get available images
const fs = require('fs');
const path = require('path');

function getAvailableImages() {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) return [];
    
    const files = fs.readdirSync(uploadsDir);
    return files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function createUsers() {
    console.log("Creating users...");
    const createdUsers = [];
    
    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const userId = uuidv4();
        
        await new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO users (id, name, email, password, is_admin) VALUES (?, ?, ?, ?, ?)",
                [userId, user.name, user.email, hashedPassword, 0],
                (err) => {
                    if (err) return reject(err);
                    createdUsers.push({ id: userId, ...user });
                    resolve();
                }
            );
        });
    }
    
    console.log(`Created ${createdUsers.length} users`);
    return createdUsers;
}

async function createClothingItems(createdUsers) {
    console.log("Creating clothing items...");
    const availableImages = getAvailableImages();
    console.log(`Found ${availableImages.length} images available`);
    
    let totalItems = 0;
    let imageIndex = 0;
    
    for (const user of createdUsers) {
        const config = clothingConfig[user.status];
        const numItems = config.items;
        
        for (let i = 0; i < numItems; i++) {
            const exif = getRandomItem(exifSamples);
            const brand = getRandomItem(config.brands);
            const category = getRandomItem(categories);
            
            const itemId = uuidv4();
            const imagePath = availableImages.length > 0 ? 
                availableImages[imageIndex % availableImages.length] : 
                `placeholder-${i}.jpg`;
            
            imageIndex++;
            
            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO clothing_items 
                    (id, user_id, brand, price, season, size, category, image_path,
                     gps_lat, gps_lon, gps_alt, datetime_original, camera_make, camera_model, software)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    itemId, user.id, brand, getRandomFloat(config.priceRange[0], config.priceRange[1]),
                    getRandomItem(seasons), getRandomItem(sizes), category, imagePath,
                    exif.lat, exif.lon, exif.alt, exif.datetime, exif.make, exif.model, "iOS/Android"
                ], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
            
            totalItems++;
        }
        
        console.log(`Created ${numItems} items for ${user.name}`);
    }
    
    console.log(`Total clothing items created: ${totalItems}`);
    return totalItems;
}

async function repopulateDatabase() {
    try {
        console.log("Starting fresh database population...");
        
        await clearAllData();
        const createdUsers = await createUsers();
        await createClothingItems(createdUsers);
        
        console.log("\n=== FINAL SUMMARY ===");
        console.log("✅ All previous data cleared");
        console.log(`✅ Created ${createdUsers.length} users with economic diversity`);
        
        const totalItems = await new Promise((resolve, reject) => {
            db.get("SELECT COUNT(*) as count FROM clothing_items", (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });
        
        console.log(`✅ Created ${totalItems} clothing items with EXIF data`);
        console.log("\n=== TEST USER ACCOUNT ===");
        console.log("Email: testuser2@email.com");
        console.log("Password: testuser2");
        console.log("Economic Status: Middle Class");
        console.log("\nDatabase population completed! 🎉");
        
    } catch (error) {
        console.error("Error:", error);
    } finally {
        db.close();
    }
}

// Run it
repopulateDatabase();