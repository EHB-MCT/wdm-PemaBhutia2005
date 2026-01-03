# Phase 1 - Project foundation

- As a developer, I can initialize a React frontend and backend project so the application has a working base.
- As a developer, I can define a clear folder structure and documentation so the project is understandable and maintainable.
- As a developer, I can run the entire system locally using Docker so setup is consistent across environments.

# Phase 2 - Core user authentication

- As a user, I can register an account so my wardrobe data is tied to my identity.
- As a user, I can log in securely using email and password so my data is protected.
- As the system, I can authenticate users with JWT tokens so access is restricted to authorized users.

# Phase 3 - Wardrobe creation & management

- As a user, I can upload images of my clothing items so I can digitally store my wardrobe.
- As a user, I can add metadata (price, brand, size, season, category) to each clothing item so items are organized.
- As a user, I can view all my clothing items in a grid so my wardrobe is easy to browse.
- As a user, I can delete clothing items so my wardrobe stays accurate.

# Phase 4 - Outfit building

- As a user, I can combine clothing items into outfits so I can plan looks.
- As a user, I can save and manage multiple outfits so I can reuse them later.
- As a user, I can preview wardrobe items while creating outfits so selection is easier.

# Phase 5 - UX improvements

- As a user, I can interact with a clean, minimal interface so the app feels intuitive.
- As a user, I can navigate between wardrobe and outfit views using a consistent navigation system.

# Phase 6 - Data collection & inference

- As the system, I can extract EXIF metadata from uploaded images so contextual data is captured (with user consent).
- As the system, I can store upload time, device, and location metadata so behavioral patterns can be analyzed.
- As the system, I can associate all collected data with a unique user ID so profiles can be built over time.

# Phase 7 - Admin access & separation

- As an admin, I can register and log in separately from normal users so I can access privileged views.
- As the system, I can protect admin routes so only admins can access analytics and user data.

# Phase 8 - Admin dashboard & visibility

- As an admin, I can view a list of users with summary statistics so I can understand the user base.
- As an admin, I can view EXIF metadata per user so I can analyze contextual behavior.
- As an admin, I can see users plotted on a map so geographic patterns emerge.

# Phase 9 - Economic & behavioral analysis

- As an admin, I can view users categorized into budget, mid-range, and premium spending tiers so economic patterns are visible.
- As an admin, I can view a histogram of photo upload times so daily routines can be inferred.
- As an admin, I can view a bubble chart of wardrobe value vs item count so consumption styles are visible.
- As the system, I can calculate price statistics per user so comparisons are possible.

# Phase 10 - Filtering, selection, and decision-making

- As an admin, I can select individual users so all charts update to reflect that user’s data.
- As an admin, I can filter users by economic status so specific groups can be analyzed.
- As an admin, I can distinguish admin users from normal users so access roles are clear.

# Phase 11 - Refinement & stability

- As a developer, I can persist all data in a database so analytics survive restarts.
- As a developer, I can run the full system using Docker Compose and environment variables so deployment is reproducible.
