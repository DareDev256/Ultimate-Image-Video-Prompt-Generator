import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// The prerendered pages (home, feed, swipe, sources, llms.txt, prompts meta) are served from the
// build output in static assets. They read public/data at build time, which a Worker cannot do
// at request time; the data only changes on a deploy, so the build-time copy is current.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
