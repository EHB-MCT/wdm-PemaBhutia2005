# Pitfalls, Shortcomings, and Reflections on the Data

While the system presents itself as objective and data-driven, the insights it produces are built on incomplete and often flawed proxies. The collected data allows for inference, not truth, and many assumptions made by the system can be misleading.

## Economic inference limitations.

Item price is used as a stand-in for wealth or socioeconomic status, but this is inherently inaccurate. Clothing may be second-hand, gifted, discounted, borrowed, or bought years ago. A low average price does not imply poverty, just as a single expensive item does not imply wealth. The stacked wardrobe class distribution simplifies complex financial realities into rigid categories, creating artificial “classes” that may not reflect users’ actual circumstances.

## Context loss in behavioral data.

Routine inference based on photo upload times assumes that the moment a photo is taken reflects daily habits or lifestyle. In reality, uploads may be delayed, batched, or influenced by external factors such as work schedules, travel, or boredom. Patterns that appear meaningful in histograms may be coincidental rather than intentional behavior.

## Geographic and metadata bias.

Location data derived from EXIF or IP-based approximation is incomplete and uneven. Users who disable location services or strip metadata become “invisible” in the user map, skewing results toward those less privacy-aware. This introduces a bias where visibility is mistaken for representativeness.

## Feedback loops and admin bias.

Admin-side filters and selections further amplify bias. The ability to filter by price range, wardrobe value, or routine patterns encourages targeted attention toward certain user groups. Over time, these selections shape which users are seen as “interesting,” reinforcing initial assumptions rather than challenging them.

# What I Learned

I learned that data does not need to be precise to feel powerful. Visualizations create confidence even when built on weak or partial signals. When multiple imperfect metrics are combined—location, time, price, frequency—they begin to resemble a coherent profile, despite being fundamentally speculative. The most significant insight is that harm does not come from a single chart, but from the accumulation of small assumptions that quietly solidify into perceived truths.
