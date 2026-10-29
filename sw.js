/* SpaceJumper v2.6.7 – updated web-app cache; never clears local game saves. */
const CACHE='spacejumper-v2.6.7';
const ASSETS=['./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>Promise.allSettled(ASSETS.map(p=>cache.add(p)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(Promise.all([caches.keys().then(names=>Promise.all(names.filter(name=>name!==CACHE&&(name.startsWith('spacejump')||name.startsWith('spacejumper'))).map(name=>caches.delete(name)))),self.clients.claim()]));
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'||url.pathname.endsWith('/index.html')){
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(resp=>{
   if(resp.ok){const copy=resp.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put('./index.html',copy)).catch(()=>{}));}
   return resp;
  }).catch(async()=>await caches.match('./index.html')||Response.error()));
  return;
 }
 event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(resp=>{
  if(resp.ok)event.waitUntil(caches.open(CACHE).then(c=>c.put(event.request,resp.clone())).catch(()=>{}));
  return resp;
 })));
});
