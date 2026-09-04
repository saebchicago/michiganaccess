// Google Analytics 4 bootstrap (G-367X8MQ1F6).
//
// Lives in a file rather than an inline <script> so script-src does not need
// 'unsafe-inline'. Loaded as a classic (non-async, non-deferred) script before
// the gtag.js loader, so window.dataLayer and the js/config commands are
// queued before the async loader arrives.
//
// Behavior is byte-for-byte the standard GA4 snippet: first-party _ga / _ga_*
// cookies, IP processed for approximate geography, Google Signals and
// advertising features not enabled. Disclosed in the footer and the Privacy
// Policy.
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", "G-367X8MQ1F6");
