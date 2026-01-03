const db = require('./config/database');

console.log("Checking sample clothing items with EXIF data...");

db.serialize(() => {
    db.all(`
        SELECT u.name as user_name, ci.brand, ci.price, ci.category,
               ci.gps_lat, ci.gps_lon, ci.camera_make, ci.camera_model, ci.datetime_original
        FROM clothing_items ci
        JOIN users u ON ci.user_id = u.id
        ORDER BY RANDOM()
        LIMIT 5
    `, (err, items) => {
        if (err) {
            console.error("Error:", err);
            return;
        }
        
        console.log("\n=== Sample Items ===");
        items.forEach((item, i) => {
            console.log(`\n${i+1}. ${item.user_name} - ${item.brand} ${item.category} ($${item.price})`);
            console.log(`   GPS: ${item.gps_lat}, ${item.gps_lon}`);
            console.log(`   Camera: ${item.camera_make} ${item.camera_model}`);
            console.log(`   Date: ${item.datetime_original}`);
        });
        
        db.close();
    });
});