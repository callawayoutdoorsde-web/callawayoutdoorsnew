Camper Page Repair — Callaway Outdoors

This PATCH contains 6 replacement files. Upload the CONTENTS of the extracted ZIP at the GitHub repository ROOT (not inside netlify/functions). Preserve the paths exactly.

Files:
  netlify.toml
  netlify/functions/rv-page.mjs
  netlify/functions/lib/_inventory-data.mjs
  js/app.js
  index.html
  inventory.html

DO NOT replace netlify/functions/inventory.mjs; it already works and is deliberately unchanged by this patch.

After Netlify deploys, test:
  https://callaway-outdoors.com/inventory
  https://callaway-outdoors.com/inventory/2024-twilight-tws31bh.html

If detail page works, run Google Search Console LIVE TEST on that URL before requesting indexing.
