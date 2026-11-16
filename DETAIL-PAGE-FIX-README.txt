DETAIL PAGE LINK FIX

Camper cards and homepage featured campers now link to /unit.html?id=<exact live inventory ID>. This bypasses the Netlify legacy /inventory/*.html redirect which could bounce visitors back to inventory. The unit detail page uses the same /api/inventory data as the cards. The photo gallery initializes after async data loads, enabling thumbnails, arrows and swipe. No DealerCenter CSV parser, pricing adjustment, SFTP credentials, or inventory feed code changed.

Deploy to a Netlify preview first. Test multiple live camper cards, prices, photos and galleries. Older bookmarked /inventory/*.html links still depend on the existing Netlify route; they are not fixed by this client-link workaround.
