const db = require('./config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Sample user data with different social statuses
const users = [
    // Test user 2 (main test account)
    {
        name: "Test User 2",
        email: "testuser2@email.com",
        password: "testuser2",
        socialStatus: "middle"
    },
    // High net worth users
    {
        name: "Alexandra Chen",
        email: "alexandra.chen@email.com", 
        password: "password123",
        socialStatus: "high"
    },
    {
        name: "Marcus Williams",
        email: "marcus.williams@email.com",
        password: "password123", 
        socialStatus: "high"
    },
    {
        name: "Sophia Rodriguez",
        email: "sophia.rodriguez@email.com",
        password: "password123",
        socialStatus: "high"
    },
    // Upper middle class
    {
        name: "James Mitchell",
        email: "james.mitchell@email.com",
        password: "password123",
        socialStatus: "upper-middle"
    },
    {
        name: "Emma Thompson",
        email: "emma.thompson@email.com", 
        password: "password123",
        socialStatus: "upper-middle"
    },
    {
        name: "David Kim",
        email: "david.kim@email.com",
        password: "password123",
        socialStatus: "upper-middle"
    },
    // Middle class
    {
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        password: "password123",
        socialStatus: "middle"
    },
    {
        name: "Michael Brown",
        email: "michael.brown@email.com",
        password: "password123",
        socialStatus: "middle"
    },
    {
        name: "Lisa Anderson",
        email: "lisa.anderson@email.com",
        password: "password123",
        socialStatus: "middle"
    },
    {
        name: "Robert Taylor",
        email: "robert.taylor@email.com",
        password: "password123",
        socialStatus: "middle"
    },
    // Budget conscious
    {
        name: "Jennifer Davis",
        email: "jennifer.davis@email.com",
        password: "password123",
        socialStatus: "budget"
    },
    {
        name: "William Martinez",
        email: "william.martinez@email.com",
        password: "password123",
        socialStatus: "budget"
    },
    {
        name: "Maria Garcia",
        email: "maria.garcia@email.com",
        password: "password123",
        socialStatus: "budget"
    },
    {
        name: "Christopher Lee",
        email: "christopher.lee@email.com",
        password: "password123",
        socialStatus: "budget"
    },
    // Additional mixed users
    {
        name: "Amanda White",
        email: "amanda.white@email.com",
        password: "password123",
        socialStatus: "middle"
    },
    {
        name: "Daniel Harris",
        email: "daniel.harris@email.com",
        password: "password123",
        socialStatus: "upper-middle"
    },
    {
        name: "Michelle Clark",
        email: "michelle.clark@email.com",
        password: "password123",
        socialStatus: "budget"
    },
    {
        name: "Kevin Lewis",
        email: "kevin.lewis@email.com",
        password: "password123",
        socialStatus: "middle"
    },
    {
        name: "Nicole Walker",
        email: "nicole.walker@email.com",
        password: "password123",
        socialStatus: "high"
    },
    {
        name: "Ryan Hall",
        email: "ryan.hall@email.com",
        password: "password123",
        socialStatus: "budget"
    }
];

// Clothing item templates based on social status
const clothingTemplates = {
    high: [
        { brand: "Gucci", category: "tops", priceRange: [800, 2500] },
        { brand: "Prada", category: "bottoms", priceRange: [1200, 3000] },
        { brand: "Balenciaga", category: "shoes", priceRange: [900, 2000] },
        { brand: "Bottega Veneta", category: "jackets", priceRange: [2500, 5000] },
        { brand: "Saint Laurent", category: "sweaters", priceRange: [800, 2000] },
        { brand: "Hermès", category: "accessories", priceRange: [500, 3000] }
    ],
    "upper-middle": [
        { brand: "Ralph Lauren", category: "tops", priceRange: [150, 400] },
        { brand: "J.Crew", category: "bottoms", priceRange: [120, 300] },
        { brand: "Cole Haan", category: "shoes", priceRange: [200, 450] },
        { brand: "Burberry", category: "jackets", priceRange: [600, 1200] },
        { brand: "Vince", category: "sweaters", priceRange: [200, 500] },
        { brand: "Kate Spade", category: "accessories", priceRange: [100, 300] }
    ],
    middle: [
        { brand: "Nike", category: "tops", priceRange: [40, 120] },
        { brand: "Levi's", category: "bottoms", priceRange: [60, 150] },
        { brand: "Adidas", category: "shoes", priceRange: [70, 180] },
        { brand: "Zara", category: "jackets", priceRange: [80, 200] },
        { brand: "H&M", category: "sweaters", priceRange: [30, 80] },
        { brand: "Fossil", category: "accessories", priceRange: [50, 150] }
    ],
    budget: [
        { brand: "Uniqlo", category: "tops", priceRange: [20, 50] },
        { brand: "Old Navy", category: "bottoms", priceRange: [25, 60] },
        { brand: "Converse", category: "shoes", priceRange: [40, 80] },
        { brand: "Gap", category: "jackets", priceRange: [50, 120] },
        { brand: "Forever 21", category: "sweaters", priceRange: [15, 40] },
        { brand: "Target", category: "accessories", priceRange: [10, 30] }
    ]
};

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const seasons = ["Spring", "Summer", "Fall", "Winter"];

// Sample EXIF data for different locations and times
const exifData = [
    {
        gps_lat: 40.7589, gps_lon: -73.9851, gps_alt: 15.5, // NYC
        datetime_original: "2024-06-15T14:30:00.000Z",
        camera_make: "Apple", camera_model: "iPhone 15 Pro", software: "iOS 17.0"
    },
    {
        gps_lat: 34.0522, gps_lon: -118.2437, gps_alt: 120.3, // LA
        datetime_original: "2024-07-22T16:45:00.000Z",
        camera_make: "Samsung", camera_model: "Galaxy S24", software: "Android 14"
    },
    {
        gps_lat: 51.5074, gps_lon: -0.1278, gps_alt: 25.1, // London
        datetime_original: "2024-05-10T11:20:00.000Z",
        camera_make: "Google", camera_model: "Pixel 8 Pro", software: "Android 14"
    },
    {
        gps_lat: 48.8566, gps_lon: 2.3522, gps_alt: 35.7, // Paris
        datetime_original: "2024-08-03T18:15:00.000Z",
        camera_make: "Apple", camera_model: "iPhone 14", software: "iOS 16.5"
    },
    {
        gps_lat: 35.6762, gps_lon: 139.6503, gps_alt: 42.2, // Tokyo
        datetime_original: "2024-09-12T13:00:00.000Z",
        camera_make: "Sony", camera_model: "Xperia 1 V", software: "Android 13"
    }
];

async function clearDatabase() {
    console.log("Clearing existing data...");
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("DELETE FROM outfits", (err) => {
                if (err) return reject(err);
                db.run("DELETE FROM clothing_items", (err) => {
                    if (err) return reject(err);
                    db.run("DELETE FROM users", (err) => {
                        if (err) return reject(err);
                        console.log("Database cleared successfully");
                        resolve();
                    });
                });
            });
        });
    });
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

function getRandomPrice(range) {
    return (Math.random() * (range[1] - range[0]) + range[0]).toFixed(2);
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getAvailableImages() {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        console.log("No uploads directory found, creating placeholder images...");
        return [];
    }
    
    const files = fs.readdirSync(uploadsDir);
    return files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
}

async function createClothingItems(createdUsers) {
    console.log("Creating clothing items...");
    const availableImages = getAvailableImages();
    console.log(`Found ${availableImages.length} images in uploads directory`);
    
    const itemsPerUser = {
        high: 15,
        "upper-middle": 12,
        middle: 8,
        budget: 5
    };
    
    let totalItems = 0;
    
    for (const user of createdUsers) {
        const numItems = itemsPerUser[user.socialStatus] || 8;
        const userItems = [];
        
        for (let i = 0; i < numItems; i++) {
            const template = getRandomItem(clothingTemplates[user.socialStatus]);
            const exif = getRandomItem(exifData);
            
            const itemId = uuidv4();
            const imagePath = availableImages.length > 0 ? 
                availableImages[totalItems % availableImages.length] : 
                `clothing-placeholder-${i}.jpg`;
            
            await new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO clothing_items 
                    (id, user_id, brand, price, season, size, category, image_path, 
                     gps_lat, gps_lon, gps_alt, datetime_original, camera_make, camera_model, software)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    itemId, user.id, template.brand, getRandomPrice(template.priceRange),
                    getRandomItem(seasons), getRandomItem(sizes), template.category,
                    imagePath,
                    exif.gps_lat, exif.gps_lon, exif.gps_alt, exif.datetime_original,
                    exif.camera_make, exif.camera_model, exif.software
                ], (err) => {
                    if (err) return reject(err);
                    userItems.push({
                        id: itemId,
                        category: template.category,
                        brand: template.brand
                    });
                    resolve();
                });
            });
        }
        
        totalItems += numItems;
        console.log(`Created ${userItems.length} items for ${user.name}`);
    }
    
    return totalItems;
}

async function createOutfits(createdUsers) {
    console.log("Creating outfits...");
    let totalOutfits = 0;
    
    const outfitNames = [
        "Casual Friday", "Weekend Brunch", "Business Meeting", "Date Night",
        "Gym Session", "Summer Vacation", "Winter Warmth", "City Explorer",
        "Coffee Run", "Evening Out", "Comfort Day", "Work From Home"
    ];
    
    for (const user of createdUsers) {
        if (Math.random() > 0.6) continue; // 40% of users have outfits
        
        // Get user's clothing items
        const userItems = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM clothing_items WHERE user_id = ?", [user.id], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
        
        const tops = userItems.filter(item => item.category === 'tops');
        const bottoms = userItems.filter(item => item.category === 'bottoms');
        const shoes = userItems.filter(item => item.category === 'shoes');
        
        const numOutfits = Math.floor(Math.random() * 4) + 1; // 1-4 outfits per user
        
        for (let i = 0; i < numOutfits; i++) {
            const outfitId = uuidv4();
            const selectedTop = getRandomItem(tops);
            const selectedBottom = getRandomItem(bottoms);
            const selectedShoes = getRandomItem(shoes);
            const outfitName = getRandomItem(outfitNames);
            
            if (selectedTop && selectedBottom && selectedShoes) {
                await new Promise((resolve, reject) => {
                    db.run(`
                        INSERT INTO outfits (id, user_id, name, top_id, bottom_id, shoes_id)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `, [outfitId, user.id, outfitName, selectedTop.id, selectedBottom.id, selectedShoes.id], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
                
                totalOutfits++;
            }
        }
    }
    
    console.log(`Created ${totalOutfits} outfits`);
    return totalOutfits;
}

async function populateDatabase() {
    try {
        console.log("Starting database population...");
        
        await clearDatabase();
        const createdUsers = await createUsers();
        const totalItems = await createClothingItems(createdUsers);
        const totalOutfits = await createOutfits(createdUsers);
        
        console.log("\n=== Population Summary ===");
        console.log(`Users created: ${createdUsers.length}`);
        console.log(`Clothing items created: ${totalItems}`);
        console.log(`Outfits created: ${totalOutfits}`);
        console.log("\nTest User 2 credentials:");
        console.log("Email: testuser2@email.com");
        console.log("Password: testuser2");
        console.log("\nDatabase population completed successfully!");
        
    } catch (error) {
        console.error("Error populating database:", error);
    } finally {
        db.close();
    }
}

// Run the population script
populateDatabase();