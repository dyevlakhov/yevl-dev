import { EMAIL } from '@/content/links';

/**
 * Inline script for the contact block's copy button (docs/architecture.md).
 * Plain DOM, no React, so it adds nothing to the client bundle. Without it the button stays hidden
 * and the address remains selectable text.
 *
 * - Success: the label reads "copied ✓" and the status line confirms it, both for 2 s.
 * - Clipboard refused or missing: the address is selected and the live region says how to copy it
 *   (⌘C on Apple platforms, Ctrl+C elsewhere, tap and hold on touch-only devices). The hint lands
 *   in a later task than the clear, so screen readers announce it again on a repeat click.
 * - Each click cancels the previous success timer, so it never wipes a newer hint.
 *
 * "Email me" links (`a[data-email-cta]`) keep their mailto. The click also copies the address and,
 * once the clipboard accepts it, shows the link's hint in its scope's status line for 8 s: on a Mac
 * with no mail app set up, mailto does nothing and the browser can't tell. A refused clipboard
 * shows nothing; the contact block still shows the address.
 */
export const copyEmailScript = `(function(){try{
var address='${EMAIL}';
document.querySelectorAll('a[data-email-cta]').forEach(function(a){
var scope=a.closest('[data-cta-scope]');
var out=scope&&scope.querySelector('[data-cta-status]');
var t;
a.addEventListener('click',function(){
var c=navigator.clipboard;
if(!out||!c||!c.writeText)return;
clearTimeout(t);out.textContent='';
c.writeText(address).then(function(){
var msg=a.getAttribute('data-email-cta');
setTimeout(function(){out.textContent=msg},50);
t=setTimeout(function(){out.textContent=''},8000);
},function(){});
});
});
var btn=document.querySelector('button[data-copy-email]');
var email=document.querySelector('[data-email]');
var status=document.querySelector('[data-copy-status]');
if(!btn||!email||!status)return;
var lbl=btn.querySelector('[data-label]')||btn;var label=lbl.textContent;var timer;
btn.hidden=false;
var hint=function(){
var mq=function(q){return matchMedia(q).matches};
if(mq('(pointer: coarse)')&&!mq('(any-pointer: fine)'))return 'data-fallback-touch';
var p=navigator.platform||(navigator.userAgentData&&navigator.userAgentData.platform)||'';
return /mac|iphone|ipad/i.test(p)?'data-fallback-mac':'data-fallback';
};
var fallback=function(){
var r=document.createRange();r.selectNodeContents(email);
var s=getSelection();s.removeAllRanges();s.addRange(r);
var text=btn.getAttribute(hint());
timer=setTimeout(function(){status.textContent=text},50);
};
btn.addEventListener('click',function(){
clearTimeout(timer);lbl.textContent=label;status.textContent='';
var c=navigator.clipboard;
if(!c||!c.writeText){fallback();return}
c.writeText(email.textContent.trim()).then(function(){
lbl.textContent=btn.getAttribute('data-copied');
status.textContent=btn.getAttribute('data-announce');
timer=setTimeout(function(){lbl.textContent=label;status.textContent=''},2000);
},fallback);
});
}catch(e){}})();`;
