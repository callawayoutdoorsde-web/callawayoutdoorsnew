# Callaway Outdoors website

Official website: https://callaway-outdoors.com  
GitHub: `callawayoutdoorsde-web/callawayoutdoorsnew` (`main`)  
Netlify site: `webdesigntwo`

A static marketing website with Netlify Functions for DealerCenter inventory,
server-rendered camper detail pages, a live XML sitemap and Google Reviews.

## Deploy

Upload all extracted ZIP contents to the GitHub repository **root**. Netlify
uses `netlify.toml` (publish directory `.`; functions `netlify/functions`).
Do not change GoDaddy DNS or Netlify API keys for a normal code update.

## Inventory and SEO

- `/api/inventory`: cached DealerCenter inventory, refreshed on demand after 24h.
- `/inventory/<id>.html`: server-rendered camper page with current price and photos.
- `/sitemap.xml`: generated from current inventory via a forced Netlify rewrite.
- `unit.html?id=...`: legacy noindex page, not linked by current inventory cards.
- All canonical URLs use https://callaway-outdoors.com (without www).

See `SEO-AND-INVENTORY-UPDATE.txt` for deployment checks and caveats.
