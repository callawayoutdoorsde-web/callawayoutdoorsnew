CALLAWAY OUTDOORS - INVENTORY API REPAIR

ONLY replace this file in your existing GitHub repository:
  netlify/functions/inventory.mjs

Do not upload this README or any other website files.

This repair removes recursive calls to /api/inventory, makes the local
inventory.json enrichment optional, and logs specific errors to Netlify.
It preserves the existing DealerCenter feed and camper ID conventions.

After Netlify deploys, open:
  https://callaway-outdoors.com/api/inventory
  https://callaway-outdoors.com/inventory
  https://callaway-outdoors.com/

The API should show a JSON array of campers. If it still shows
{"error":"Live inventory unavailable"}, open Netlify Functions > inventory
logs and find the line starting "[inventory] Live feed failure:".

This file does not modify your working contact/trade forms or SEO routes.
