(() => {
 const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav');
 function close(){nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false')}
 toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open)});
 nav.addEventListener('click',e=>{if(e.target.closest('a'))close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});document.addEventListener('click',e=>{if(!e.target.closest('.top'))close()});
 const meta={PyLearn:['python','Python · Türkçe dersler'], 'MakersHub Studio':['tasarim','Arduino · Devre · 3B tasarım'],'Kod Noktası':['python','Kod okuma · Mantık'],Tilely:['oyun','Okul öncesi · Mozaik'],Sandly:['tasarim','Serbest keşif · Tasarım'],RoboBlok:['oyun','Bloklarla kodlama'],ServoLab:['tasarim','Servo · Robotik'],PinHarita:['tasarim','Arduino · Pin rehberi'],Kodlandia:['oyun','Anaokulu – 7. sınıf'],Pathly:['oyun','Okul öncesi · İlkokul'],Cubo:['oyun','5–10 yaş · 3B bulmaca']};
 const cards=[...document.querySelectorAll('#araclar .tool')];
 cards.forEach(c=>{const name=c.querySelector('h3').textContent.trim(),m=meta[name]||['tasarim','Deneyerek öğren'];c.dataset.category=m[0];const el=document.createElement('div');el.className='app-audience';el.textContent=m[1];c.querySelector('.app-title').after(el)});
 const count=document.querySelector('[data-app-filter="all"] span');if(count)count.textContent=cards.length;
 function filter(value){document.querySelectorAll('[data-app-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.appFilter===value)));cards.forEach(c=>{c.hidden=value!=='all'&&c.dataset.category!==value;c.classList.remove('reveal-card');if(!c.hidden){void c.offsetWidth;c.classList.add('reveal-card')}})}
 document.querySelector('.app-filters').addEventListener('click',e=>{const b=e.target.closest('[data-app-filter]');if(b)filter(b.dataset.appFilter)});
 document.querySelector('[data-start="oyun"]').addEventListener('click',()=>filter('oyun'));
 const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){nav.querySelectorAll('a').forEach(a=>a.classList.toggle('current',a.hash==='#'+e.target.id))}})},{rootMargin:'-15% 0px -65% 0px',threshold:0});document.querySelectorAll('main section[id]').forEach(s=>observer.observe(s));
})();
(() => {
 const root=document.documentElement,button=document.querySelector('.theme-toggle'),system=matchMedia('(prefers-color-scheme: dark)');
 const sync=()=>{const dark=root.dataset.theme==='dark';button.setAttribute('aria-pressed',String(dark));button.setAttribute('aria-label',dark?'Açık temaya geç':'Koyu temaya geç');button.querySelector('.theme-label').textContent=dark?'Açık':'Koyu'};
 button.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('fk-theme',root.dataset.theme)}catch{}sync()});
 system.addEventListener('change',e=>{let saved;try{saved=localStorage.getItem('fk-theme')}catch{}if(!saved){root.dataset.theme=e.matches?'dark':'light';sync()}});sync();
})();
