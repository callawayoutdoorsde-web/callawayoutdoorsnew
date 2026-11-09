# Callaway Outdoors site

## Deploy
Unzip and drag this entire folder into Netlify.

## AppOne
Open `js/config.js` and paste the dealer-specific AppOne application URL into `appOneUrl`. Do not embed or collect SSNs directly on this site.

## Business texting
The current landline is not text-enabled. `textEnabled` is false in `js/config.js`. After porting 302-640-5353 to a texting-capable VoIP provider and completing business texting registration, set it to true and use that number for future text CTAs.

## DealerCenter feed
`data/inventory.json` is the temporary inventory source. Once DealerCenter supplies a feed/API, replace the JSON sync while keeping the same fields. Each unit can include a `photos` array and `source_url`.

## SEO included
- Unique page titles and meta descriptions
- Canonical URLs
- LocalBusiness structured data
- Product/Offer structured data on each unit
- Static descriptive unit URLs in `/inventory/`
- sitemap.xml and robots.txt
- Open Graph metadata
- Mobile-first navigation

After the custom domain is live, verify `https://www.callaway-outdoors.com/sitemap.xml` in Google Search Console and request indexing.
