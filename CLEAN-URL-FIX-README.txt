CLEAN CAMPER URL FIX

This build keeps all working /unit.html?id= camper links unchanged.

The clean SEO route is handled directly inside netlify/functions/rv-page.mjs:
  /inventory/:slug.html

The old netlify.toml rewrite for /inventory/:slug.html was removed so there is
no slug query-string handoff to fail. Netlify passes the slug in context.params.

After deployment, test:
https://callaway-outdoors.com/inventory/2024-twilight-tws31bh.html

Do not switch inventory-card links until that direct URL loads the camper page.
