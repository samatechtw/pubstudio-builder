// Base page CSS emitted into each generated page's <head>.
// Keep in sync with the <style> block in apps/web-site/src/app/App.vue
// (loading spinner / error styles omitted — static pages never show them).
export const BASE_PAGE_CSS = [
  'html,body{padding:0;margin:0;width:100%;height:100%;}',
  'html *,body *{box-sizing:border-box;}',
  '.pm-p{word-wrap:break-word;white-space:pre-wrap;}',
  ".pm-p::after{content:'\\200b';}",
  'p{margin:0;}',
  'a{text-decoration:none;color:unset;}',
  '.noscroll{overflow:hidden;}',
  '.clip-path{position:absolute;}',
  '#app{display:flex;flex-direction:column;flex-shrink:0;flex-grow:1;height:100%;}',
  '._rc{flex-grow:1;}',
  '@media print{@page{padding:0;margin:-44px 0;border:none;border-collapse:collapse;}}',
].join('')
