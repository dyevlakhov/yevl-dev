/**
 * Inline script for effect 16, variant D (ADR 0002). Plain DOM, no React, so it adds
 * nothing to the client bundle.
 *
 * The fill itself is server-rendered (one aria-hidden span per [data-glide] wrapper, next to the
 * list) and shown only with JS and a fine pointer (globals.css). The script never changes the DOM
 * structure, which would make React re-render the tree on hydration; it only listens and moves the
 * fill.
 *
 * - Runs only with a fine pointer that can hover.
 * - On each card's pointerenter it measures the card against the wrapper (fresh every time, so a
 *   resize never leaves it stale) and moves the fill there. Coming from outside the list, the fill
 *   appears in place; between cards it glides. It fades out when the pointer leaves the list.
 */
export const cardGlideScript = `(function(){try{
if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return;
[].forEach.call(document.querySelectorAll('[data-glide]'),function(wrap){
var g=wrap.querySelector('.card-glide'),list=wrap.querySelector('ul,ol');if(!g||!list)return;
var inside=false;
var place=function(li){var w=wrap.getBoundingClientRect(),r=li.getBoundingClientRect();
g.style.transform='translate('+(r.left-w.left)+'px,'+(r.top-w.top)+'px)';g.style.width=r.width+'px';g.style.height=r.height+'px'};
[].forEach.call(list.children,function(li){li.addEventListener('pointerenter',function(){
if(inside)place(li);else{g.classList.add('jump');place(li);void g.offsetWidth;g.classList.remove('jump');inside=true}
g.classList.add('on')})});
list.addEventListener('pointerleave',function(){inside=false;g.classList.remove('on')});
});
}catch(e){}})();`;
