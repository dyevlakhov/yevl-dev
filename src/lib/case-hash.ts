/**
 * Inline script for the case studies (docs/architecture.md).
 * Plain DOM, no React, so it adds nothing to the client bundle. Without it, `<details>` still opens
 * by click and the Collapse buttons stay hidden.
 *
 * - A case hash on load, on hashchange or on history traversal opens that case and scrolls to it.
 * - Opening a case pushes its hash; closing the case named in the URL replaces the hash with #work,
 *   so a reload does not reopen it.
 * - Collapse closes the case, moves focus to its summary and scrolls back to the card.
 */
export const caseHashScript = `(function(){try{
var all=[].slice.call(document.querySelectorAll('details[data-case]'));
if(!all.length)return;
var reduce=function(){return window.matchMedia('(prefers-reduced-motion: reduce)').matches};
var scrollTo=function(d){var a=d.closest('article')||d;a.scrollIntoView({behavior:reduce()?'auto':'smooth',block:'start'})};
var find=function(slug){for(var i=0;i<all.length;i++)if(all[i].getAttribute('data-case')===slug)return all[i];return null};
var fromHash=function(){var slug=decodeURIComponent(location.hash.slice(1));var d=slug&&find(slug);if(!d)return;d.open=true;scrollTo(d)};
all.forEach(function(d){
var slug=d.getAttribute('data-case');
d.addEventListener('toggle',function(){
var current=location.hash.slice(1);
if(d.open){if(current!==slug)history.pushState(null,'','#'+slug)}
else if(current===slug){history.replaceState(null,'','#work')}
});
var btn=d.querySelector('[data-collapse]');
if(btn){btn.hidden=false;btn.addEventListener('click',function(){d.open=false;var s=d.querySelector('summary');if(s)s.focus({preventScroll:true});scrollTo(d)})}
});
window.addEventListener('hashchange',fromHash);
window.addEventListener('popstate',fromHash);
fromHash();
}catch(e){}})();`;
