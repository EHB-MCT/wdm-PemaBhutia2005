const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

// Connect to correct database
const db = new sqlite3.Database('../database.sqlite');

console.log("🔄 Updating Test User 2's wardrobe with categorized images...");

// Map image files to categories
const imageCategories = {
    'tops': [
        { file: 'top1.jpg', brand: 'Nike', price: '45.99' },
        { file: 'top2.jpg', brand: 'H&M', price: '29.99' },
        { file: 'top3.jpg', brand: 'Zara', price: '39.99' },
        { file: 'top4.jpg', brand: 'Gap', price: '35.99' },
        { file: 'top5.jpg', brand: 'Uniqlo', price: '49.99' },
        { file: 'top6.jpg', brand: 'Adidas', price: '55.99' }
    ],
    'bottoms': [
        { file: 'bottoms1.jpg', brand: 'Levi\'s', price: '89.99' },
        { file: 'bottoms2.jpg', brand: 'Old Navy', price: '34.99' },
        { file: 'bottoms3.jpg', brand: 'Zara', price: '59.99' }
    ],
    'shoes': [
        { file: 'shoes.jpg', brand: 'Converse', price: '65.99' },
        { file: 'shoes2.jpg', brand: 'Nike', price: '89.99' }
    ],
    'jackets': [
        { file: 'jacket1.jpg', brand: 'The North Face', price: '149.99' },
        { file: 'jacket2.png', brand: 'Patagonia', price: '199.99' }
    ],
    'sweaters': [
        { file: 'sweater1.jpg', brand: 'J.Crew', price: '79.99' }
    ]
};

const seasons = ["Spring", "Summer", "Fall", "Winter"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

// Real EXIF data samples
const exifSamples = [
    { lat: 40.7589, lon: -73.9851, alt: 15.5, datetime: "2024-06-15T14:30:00.000Z", make: "Apple", model: "iPhone 15 Pro" },
    { lat: 34.0522, lon: -118.2437, alt: 120.3, datetime: "2024-07-22T16:45:00.000Z", make: "Samsung", model: "Galaxy S24" },
    { lat: 51.5074, lon: -0.1278, alt: 25.1, datetime: "2024-05-10T11:20:00.000Z", make: "Google", model: "Pixel 8 Pro" },
    { lat: 48.8566, lon: 2.3522, alt: 35.7, datetime: "2024-08-03T18:15:00.000Z", make: "Apple", model: "iPhone 14" }
];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function getTestUser2Id() {
    return new Promise((resolve, reject) => {
        db.get("SELECT id FROM users WHERE email = 'testuser2@email.com'", (err, row) => {
            if (err) reject(err);
            else if (row) resolve(row.id);
            else reject(new Error("Test User 2 not found"));
        });
    });
}

async function deleteTestUser2Items(userId) {
    console.log("Removing old items from Test User 2...");
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM clothing_items WHERE user_id = ?", [userId], (err) => {
            if (err) reject(err);
            else {
                console.log("✅ Removed old items");
                resolve();
            }
        });
    });
}

async function createTestUser2Items(userId) {
    console.log("Creating new categorized items for Test User 2...");
    let totalItems = 0;

    for (const [category, items] of Object.entries(imageCategories)) {
        console.log(`\n📁 Processing ${category}:`);
        
        for (const item of items) {
            const exif = getRandomItem(exifSamples);
            const itemId = uuidv4();
            
            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO clothing_items 
                    (id, user_id, brand, price, season, size, category, image_path,
                     gps_lat, gps_lon, gps_alt, datetime_original, camera_make, camera_model, software)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    itemId, userId, item.brand, item.price,
                    getRandomItem(seasons), getRandomItem(sizes), category, item.file,
                    exif.lat, exif.lon, exif.alt, exif.datetime, exif.make, exif.model, "iOS/Android"
                ], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
            
            totalItems++;
            console.log(`  ✅ ${item.brand} ${category} (${item.file}) - $${item.price}`);
        }
    }
    
    console.log(`\n✅ Total items created: ${totalItems}`);
    return totalItems;
}

async function showTestUser2Items(userId) {
    console.log("\n📋 Test User 2's updated wardrobe:");
    
    db.all(`
        SELECT category, brand, price, image_path 
        FROM clothing_items 
        WHERE user_id = ? 
        ORDER BY category, brand
    `, [userId], (err, items) => {
        if (err) {
            console.error("Error:", err);
            return;
        }
        
        items.forEach(item => {
            console.log(`👕 ${item.category.toUpperCase()}: ${item.brand} - $${item.price} (${item.image_path})`);
        });
        
        console.log(`\n📊 Total items: ${items.length}`);
        
        // Count by category
        const categories = {};
        items.forEach(item => {
            categories[item.category] = (categories[item.category] || 0) + 1;
        });
        
        console.log("\n📈 By category:");
        Object.entries(categories).forEach(([cat, count]) => {
            console.log(`  ${cat}: ${count} items`);
        });
        
        db.close();
    });
}

async function updateTestUser2Wardrobe() {
    try {
        const userId = await getTestUser2Id();
        
        await deleteTestUser2Items(userId);
        await createTestUser2Items(userId);
        await showTestUser2Items(userId);
        
        console.log("\n🎉 Test User 2's wardrobe updated successfully!");
        console.log("🔑 Login: testuser2@email.com / testuser2");
        
    } catch (error) {
        console.error("❌ Error:", error);
        db.close();
    }
}

// Run the update
updateTestUser2Wardrobe();