/* esm.sh - esbuild bundle(solid-js@1.8.1) es2022 production */
var Ke=1,ge=!1,pe=!1,G=[],D=null,we=null,Ye=5,ae=0,Ge=300,be=null,ne=null,Qe=1073741823;function Xe(){let e=new MessageChannel,t=e.port2;if(be=()=>t.postMessage(null),e.port1.onmessage=()=>{if(ne!==null){let r=performance.now();ae=r+Ye;let n=!0;try{ne(n,r)?t.postMessage(null):ne=null}catch(i){throw t.postMessage(null),i}}},navigator&&navigator.scheduling&&navigator.scheduling.isInputPending){let r=navigator.scheduling;we=()=>{let n=performance.now();return n>=ae?r.isInputPending()?!0:n>=Ge:!1}}else we=()=>performance.now()>=ae}function Je(e,t){function r(){let n=0,i=e.length-1;for(;n<=i;){let s=i+n>>1,u=t.expirationTime-e[s].expirationTime;if(u>0)n=s+1;else if(u<0)i=s-1;else return s}return n}e.splice(r(),0,t)}function Te(e,t){be||Xe();let r=performance.now(),n=Qe;t&&t.timeout&&(n=t.timeout);let i={id:Ke++,fn:e,startTime:r,expirationTime:r+n};return Je(G,i),!ge&&!pe&&(ge=!0,ne=Ze,be()),i}function bt(e){e.fn=null}function Ze(e,t){ge=!1,pe=!0;try{return et(e,t)}finally{D=null,pe=!1}}function et(e,t){let r=t;for(D=G[0]||null;D!==null&&!(D.expirationTime>r&&(!e||we()));){let n=D.fn;if(n!==null){D.fn=null;let i=D.expirationTime<=r;n(i),r=performance.now(),D===G[0]&&G.shift()}else G.shift();D=G[0]||null}return D!==null}var h={context:void 0,registry:void 0};function q(e){h.context=e}function tt(){return{...h.context,id:`${h.context.id}${h.context.count++}-`,count:0}}var Pe=(e,t)=>e===t,se=Symbol("solid-proxy"),Fe=Symbol("solid-track"),mt=Symbol("solid-dev-component"),ie={equals:Pe},L=null,je=Ne,V=1,X=2,Ie={owned:null,cleanups:null,context:null,owner:null},de={},d=null,l=null,K=null,z=null,g=null,y=null,k=null,oe=0,[nt,ke]=j(!1);function B(e,t){let r=g,n=d,i=e.length===0,s=t===void 0?n:t,u=i?Ie:{owned:null,cleanups:null,context:s?s.context:null,owner:s},o=i?e:()=>e(()=>O(()=>H(u)));d=u,g=null;try{return M(o,!0)}finally{g=r,d=n}}function j(e,t){t=t?Object.assign({},ie,t):ie;let r={value:e,observers:null,observerSlots:null,comparator:t.equals||void 0},n=i=>(typeof i=="function"&&(l&&l.running&&l.sources.has(r)?i=i(r.tValue):i=i(r.value)),De(r,i));return[Re.bind(r),n]}function Oe(e,t,r){let n=_(e,t,!0,V);K&&l&&l.running?y.push(n):W(n)}function rt(e,t,r){let n=_(e,t,!1,V);K&&l&&l.running?y.push(n):W(n)}function Ve(e,t,r){je=ft;let n=_(e,t,!1,V),i=U&&Z(U);i&&(n.suspense=i),(!r||!r.render)&&(n.user=!0),k?k.push(n):W(n)}function xt(e,t){let r,n=_(()=>{r?r():O(e),r=void 0},void 0,!1,0),i=U&&Z(U);return i&&(n.suspense=i),n.user=!0,s=>{r=s,W(n)}}function A(e,t,r){r=r?Object.assign({},ie,r):ie;let n=_(e,t,!0,0);return n.observers=null,n.observerSlots=null,n.comparator=r.equals||void 0,K&&l&&l.running?(n.tState=V,y.push(n)):W(n),Re.bind(n)}function Ce(e){return e&&typeof e=="object"&&"then"in e}function st(e,t,r){let n,i,s;arguments.length===2&&typeof t=="object"||arguments.length===1?(n=!0,i=e,s=t||{}):(n=e,i=t,s=r||{});let u=null,o=de,f=null,a=!1,c=!1,p="initialValue"in s,w=typeof n=="function"&&A(n),b=new Set,[T,S]=(s.storage||j)(s.initialValue),[P,F]=j(void 0),[x,v]=j(void 0,{equals:!1}),[C,$]=j(p?"ready":"unresolved");if(h.context){f=`${h.context.id}${h.context.count++}`;let m;s.ssrLoadFrom==="initial"?o=s.initialValue:h.load&&(m=h.load(f))&&(o=Ce(m)&&"value"in m?m.value:m)}function R(m,E,I,Y){return u===m&&(u=null,Y!==void 0&&(p=!0),(m===o||E===o)&&s.onHydrated&&queueMicrotask(()=>s.onHydrated(Y,{value:E})),o=de,l&&m&&a?(l.promises.delete(m),a=!1,M(()=>{l.running=!0,ve(E,I)},!1)):ve(E,I)),E}function ve(m,E){M(()=>{E===void 0&&S(()=>m),$(E!==void 0?"errored":p?"ready":"unresolved"),F(E);for(let I of b.keys())I.decrement();b.clear()},!1)}function ce(){let m=U&&Z(U),E=T(),I=P();if(I!==void 0&&!u)throw I;return g&&!g.user&&m&&Oe(()=>{x(),u&&(m.resolved&&l&&a?l.promises.add(u):b.has(m)||(m.increment(),b.add(m)))}),E}function fe(m=!0){if(m!==!1&&c)return;c=!1;let E=w?w():n;if(a=l&&l.running,E==null||E===!1){R(u,O(T));return}l&&u&&l.promises.delete(u);let I=o!==de?o:O(()=>i(E,{value:T(),refetching:m}));return Ce(I)?(u=I,c=!0,queueMicrotask(()=>c=!1),M(()=>{$(p?"refreshing":"pending"),v()},!1),I.then(Y=>R(I,Y,void 0,E),Y=>R(I,void 0,He(Y),E))):(R(u,I,void 0,E),I)}return Object.defineProperties(ce,{state:{get:()=>C()},error:{get:()=>P()},loading:{get(){let m=C();return m==="pending"||m==="refreshing"}},latest:{get(){if(!p)return ce();let m=P();if(m&&!u)throw m;return T()}}}),w?Oe(()=>fe(!1)):fe(!1),[ce,{refetch:fe,mutate:S}]}function yt(e,t){let r,n=t?t.timeoutMs:void 0,i=_(()=>((!r||!r.fn)&&(r=Te(()=>u(()=>i.value),n!==void 0?{timeout:n}:void 0)),e()),void 0,!0),[s,u]=j(l&&l.running&&l.sources.has(i)?i.tValue:i.value,t);return W(i),u(()=>l&&l.running&&l.sources.has(i)?i.tValue:i.value),s}function St(e,t=Pe,r){let n=new Map,i=_(s=>{let u=e();for(let[o,f]of n.entries())if(t(o,u)!==t(o,s))for(let a of f.values())a.state=V,a.pure?y.push(a):k.push(a);return u},void 0,!0,V);return W(i),s=>{let u=g;if(u){let o;(o=n.get(s))?o.add(u):n.set(s,o=new Set([u])),N(()=>{o.delete(u),!o.size&&n.delete(s)})}return t(s,l&&l.running&&l.sources.has(i)?i.tValue:i.value)}}function vt(e){return M(e,!1)}function O(e){if(g===null)return e();let t=g;g=null;try{return e()}finally{g=t}}function kt(e,t,r){let n=Array.isArray(e),i,s=r&&r.defer;return u=>{let o;if(n){o=Array(e.length);for(let a=0;a<e.length;a++)o[a]=e[a]()}else o=e();if(s){s=!1;return}let f=O(()=>t(o,i,u));return i=o,f}}function Ot(e){Ve(()=>O(e))}function N(e){return d===null||(d.cleanups===null?d.cleanups=[e]:d.cleanups.push(e)),e}function it(e,t){L||(L=Symbol("error")),d=_(void 0,void 0,!0),d.context={...d.context,[L]:[t]},l&&l.running&&l.sources.add(d);try{return e()}catch(r){ee(r)}finally{d=d.owner}}function Ct(){return g}function Me(){return d}function Et(e,t){let r=d,n=g;d=e,g=null;try{return M(t,!0)}catch(i){ee(i)}finally{d=r,g=n}}function At(e=Te){K=e}function $e(e){if(l&&l.running)return e(),l.done;let t=g,r=d;return Promise.resolve().then(()=>{g=t,d=r;let n;return(K||U)&&(n=l||(l={sources:new Set,effects:[],promises:new Set,disposed:new Set,queue:new Set,running:!0}),n.done||(n.done=new Promise(i=>n.resolve=i)),n.running=!0),M(e,!1),g=d=null,n?n.done:void 0})}function Tt(){return[nt,$e]}function ut(e){k.push.apply(k,e),e.length=0}function Le(e,t){let r=Symbol("context");return{id:r,Provider:at(r),defaultValue:e}}function Z(e){return d&&d.context&&d.context[e.id]!==void 0?d.context[e.id]:e.defaultValue}function qe(e){let t=A(e),r=A(()=>me(t()));return r.toArray=()=>{let n=r();return Array.isArray(n)?n:n!=null?[n]:[]},r}var U;function lt(){return U||(U=Le())}function Pt(e){if(z){let t=z;z=(r,n)=>{let i=t(r,n),s=e(u=>i.track(u),n);return{track:u=>s.track(u),dispose(){s.dispose(),i.dispose()}}}}else z=e}function Re(){let e=l&&l.running;if(this.sources&&(e?this.tState:this.state))if((e?this.tState:this.state)===V)W(this);else{let t=y;y=null,M(()=>ue(this),!1),y=t}if(g){let t=this.observers?this.observers.length:0;g.sources?(g.sources.push(this),g.sourceSlots.push(t)):(g.sources=[this],g.sourceSlots=[t]),this.observers?(this.observers.push(g),this.observerSlots.push(g.sources.length-1)):(this.observers=[g],this.observerSlots=[g.sources.length-1])}return e&&l.sources.has(this)?this.tValue:this.value}function De(e,t,r){let n=l&&l.running&&l.sources.has(e)?e.tValue:e.value;if(!e.comparator||!e.comparator(n,t)){if(l){let i=l.running;(i||!r&&l.sources.has(e))&&(l.sources.add(e),e.tValue=t),i||(e.value=t)}else e.value=t;e.observers&&e.observers.length&&M(()=>{for(let i=0;i<e.observers.length;i+=1){let s=e.observers[i],u=l&&l.running;u&&l.disposed.has(s)||((u?!s.tState:!s.state)&&(s.pure?y.push(s):k.push(s),s.observers&&Ue(s)),u?s.tState=V:s.state=V)}if(y.length>1e6)throw y=[],new Error},!1)}return t}function W(e){if(!e.fn)return;H(e);let t=d,r=g,n=oe;g=d=e,Ee(e,l&&l.running&&l.sources.has(e)?e.tValue:e.value,n),l&&!l.running&&l.sources.has(e)&&queueMicrotask(()=>{M(()=>{l&&(l.running=!0),g=d=e,Ee(e,e.tValue,n),g=d=null},!1)}),g=r,d=t}function Ee(e,t,r){let n;try{n=e.fn(t)}catch(i){return e.pure&&(l&&l.running?(e.tState=V,e.tOwned&&e.tOwned.forEach(H),e.tOwned=void 0):(e.state=V,e.owned&&e.owned.forEach(H),e.owned=null)),e.updatedAt=r+1,ee(i)}(!e.updatedAt||e.updatedAt<=r)&&(e.updatedAt!=null&&"observers"in e?De(e,n,!0):l&&l.running&&e.pure?(l.sources.add(e),e.tValue=n):e.value=n,e.updatedAt=r)}function _(e,t,r,n=V,i){let s={fn:e,state:n,updatedAt:null,owned:null,sources:null,sourceSlots:null,cleanups:null,value:t,owner:d,context:d?d.context:null,pure:r};if(l&&l.running&&(s.state=0,s.tState=n),d===null||d!==Ie&&(l&&l.running&&d.pure?d.tOwned?d.tOwned.push(s):d.tOwned=[s]:d.owned?d.owned.push(s):d.owned=[s]),z){let[u,o]=j(void 0,{equals:!1}),f=z(s.fn,o);N(()=>f.dispose());let a=()=>$e(o).then(()=>c.dispose()),c=z(s.fn,a);s.fn=p=>(u(),l&&l.running?c.track(p):f.track(p))}return s}function J(e){let t=l&&l.running;if((t?e.tState:e.state)===0)return;if((t?e.tState:e.state)===X)return ue(e);if(e.suspense&&O(e.suspense.inFallback))return e.suspense.effects.push(e);let r=[e];for(;(e=e.owner)&&(!e.updatedAt||e.updatedAt<oe);){if(t&&l.disposed.has(e))return;(t?e.tState:e.state)&&r.push(e)}for(let n=r.length-1;n>=0;n--){if(e=r[n],t){let i=e,s=r[n+1];for(;(i=i.owner)&&i!==s;)if(l.disposed.has(i))return}if((t?e.tState:e.state)===V)W(e);else if((t?e.tState:e.state)===X){let i=y;y=null,M(()=>ue(e,r[0]),!1),y=i}}}function M(e,t){if(y)return e();let r=!1;t||(y=[]),k?r=!0:k=[],oe++;try{let n=e();return ot(r),n}catch(n){r||(k=null),y=null,ee(n)}}function ot(e){if(y&&(K&&l&&l.running?ct(y):Ne(y),y=null),e)return;let t;if(l){if(!l.promises.size&&!l.queue.size){let n=l.sources,i=l.disposed;k.push.apply(k,l.effects),t=l.resolve;for(let s of k)"tState"in s&&(s.state=s.tState),delete s.tState;l=null,M(()=>{for(let s of i)H(s);for(let s of n){if(s.value=s.tValue,s.owned)for(let u=0,o=s.owned.length;u<o;u++)H(s.owned[u]);s.tOwned&&(s.owned=s.tOwned),delete s.tValue,delete s.tOwned,s.tState=0}ke(!1)},!1)}else if(l.running){l.running=!1,l.effects.push.apply(l.effects,k),k=null,ke(!0);return}}let r=k;k=null,r.length&&M(()=>je(r),!1),t&&t()}function Ne(e){for(let t=0;t<e.length;t++)J(e[t])}function ct(e){for(let t=0;t<e.length;t++){let r=e[t],n=l.queue;n.has(r)||(n.add(r),K(()=>{n.delete(r),M(()=>{l.running=!0,J(r)},!1),l&&(l.running=!1)}))}}function ft(e){let t,r=0;for(t=0;t<e.length;t++){let n=e[t];n.user?e[r++]=n:J(n)}if(h.context){if(h.count){h.effects||(h.effects=[]),h.effects.push(...e.slice(0,r));return}else h.effects&&(e=[...h.effects,...e],r+=h.effects.length,delete h.effects);q()}for(t=0;t<r;t++)J(e[t])}function ue(e,t){let r=l&&l.running;r?e.tState=0:e.state=0;for(let n=0;n<e.sources.length;n+=1){let i=e.sources[n];if(i.sources){let s=r?i.tState:i.state;s===V?i!==t&&(!i.updatedAt||i.updatedAt<oe)&&J(i):s===X&&ue(i,t)}}}function Ue(e){let t=l&&l.running;for(let r=0;r<e.observers.length;r+=1){let n=e.observers[r];(t?!n.tState:!n.state)&&(t?n.tState=X:n.state=X,n.pure?y.push(n):k.push(n),n.observers&&Ue(n))}}function H(e){let t;if(e.sources)for(;e.sources.length;){let r=e.sources.pop(),n=e.sourceSlots.pop(),i=r.observers;if(i&&i.length){let s=i.pop(),u=r.observerSlots.pop();n<i.length&&(s.sourceSlots[u]=n,i[n]=s,r.observerSlots[n]=u)}}if(l&&l.running&&e.pure){if(e.tOwned){for(t=e.tOwned.length-1;t>=0;t--)H(e.tOwned[t]);delete e.tOwned}We(e,!0)}else if(e.owned){for(t=e.owned.length-1;t>=0;t--)H(e.owned[t]);e.owned=null}if(e.cleanups){for(t=e.cleanups.length-1;t>=0;t--)e.cleanups[t]();e.cleanups=null}l&&l.running?e.tState=0:e.state=0}function We(e,t){if(t||(e.tState=0,l.disposed.add(e)),e.owned)for(let r=0;r<e.owned.length;r++)We(e.owned[r])}function He(e){return e instanceof Error?e:new Error(typeof e=="string"?e:"Unknown error",{cause:e})}function Ae(e,t,r){try{for(let n of t)n(e)}catch(n){ee(n,r&&r.owner||null)}}function ee(e,t=d){let r=L&&t&&t.context&&t.context[L],n=He(e);if(!r)throw n;k?k.push({fn(){Ae(n,r,t)},state:V}):Ae(n,r,t)}function me(e){if(typeof e=="function"&&!e.length)return me(e());if(Array.isArray(e)){let t=[];for(let r=0;r<e.length;r++){let n=me(e[r]);Array.isArray(n)?t.push.apply(t,n):t.push(n)}return t}return e}function at(e,t){return function(n){let i;return rt(()=>i=O(()=>(d.context={...d.context,[e]:n.value},qe(()=>n.children))),void 0),i}}function Ft(e){L||(L=Symbol("error")),d===null||(d.context===null||!d.context[L]?(d.context={...d.context,[L]:[e]},re(d,L,[e])):d.context[L].push(e))}function re(e,t,r){if(e.owned)for(let n=0;n<e.owned.length;n++)e.owned[n].context===e.context&&re(e.owned[n],t,r),e.owned[n].context?e.owned[n].context[t]||(e.owned[n].context[t]=r,re(e.owned[n],t,r)):(e.owned[n].context=e.context,re(e.owned[n],t,r))}function jt(e){return{subscribe(t){if(!(t instanceof Object)||t==null)throw new TypeError("Expected the observer to be an object.");let r=typeof t=="function"?t:t.next&&t.next.bind(t);if(!r)return{unsubscribe(){}};let n=B(i=>(Ve(()=>{let s=e();O(()=>r(s))}),i));return Me()&&N(n),{unsubscribe(){n()}}},[Symbol.observable||"@@observable"](){return this}}}function It(e){let[t,r]=j(void 0,{equals:!1});if("subscribe"in e){let n=e.subscribe(i=>r(()=>i));N(()=>"unsubscribe"in n?n.unsubscribe():n())}else{let n=e(r);N(n)}return t}var xe=Symbol("fallback");function le(e){for(let t=0;t<e.length;t++)e[t]()}function dt(e,t,r={}){let n=[],i=[],s=[],u=0,o=t.length>1?[]:null;return N(()=>le(s)),()=>{let f=e()||[],a,c;return f[Fe],O(()=>{let w=f.length,b,T,S,P,F,x,v,C,$;if(w===0)u!==0&&(le(s),s=[],n=[],i=[],u=0,o&&(o=[])),r.fallback&&(n=[xe],i[0]=B(R=>(s[0]=R,r.fallback())),u=1);else if(u===0){for(i=new Array(w),c=0;c<w;c++)n[c]=f[c],i[c]=B(p);u=w}else{for(S=new Array(w),P=new Array(w),o&&(F=new Array(w)),x=0,v=Math.min(u,w);x<v&&n[x]===f[x];x++);for(v=u-1,C=w-1;v>=x&&C>=x&&n[v]===f[C];v--,C--)S[C]=i[v],P[C]=s[v],o&&(F[C]=o[v]);for(b=new Map,T=new Array(C+1),c=C;c>=x;c--)$=f[c],a=b.get($),T[c]=a===void 0?-1:a,b.set($,c);for(a=x;a<=v;a++)$=n[a],c=b.get($),c!==void 0&&c!==-1?(S[c]=i[a],P[c]=s[a],o&&(F[c]=o[a]),c=T[c],b.set($,c)):s[a]();for(c=x;c<w;c++)c in S?(i[c]=S[c],s[c]=P[c],o&&(o[c]=F[c],o[c](c))):i[c]=B(p);i=i.slice(0,u=w),n=f.slice(0)}return i});function p(w){if(s[c]=w,o){let[b,T]=j(c);return o[c]=T,t(f[c],b)}return t(f[c])}}}function ht(e,t,r={}){let n=[],i=[],s=[],u=[],o=0,f;return N(()=>le(s)),()=>{let a=e()||[];return a[Fe],O(()=>{if(a.length===0)return o!==0&&(le(s),s=[],n=[],i=[],o=0,u=[]),r.fallback&&(n=[xe],i[0]=B(p=>(s[0]=p,r.fallback())),o=1),i;for(n[0]===xe&&(s[0](),s=[],n=[],i=[],o=0),f=0;f<a.length;f++)f<n.length&&n[f]!==a[f]?u[f](()=>a[f]):f>=n.length&&(i[f]=B(c));for(;f<n.length;f++)s[f]();return o=u.length=s.length=a.length,n=a.slice(0),i=i.slice(0,o)});function c(p){s[f]=p;let[w,b]=j(a[f]);return u[f]=b,t(w,f)}}}var _e=!1;function Vt(){_e=!0}function ze(e,t){if(_e&&h.context){let r=h.context;q(tt());let n=O(()=>e(t||{}));return q(r),n}return O(()=>e(t||{}))}function te(){return!0}var ye={get(e,t,r){return t===se?r:e.get(t)},has(e,t){return t===se?!0:e.has(t)},set:te,deleteProperty:te,getOwnPropertyDescriptor(e,t){return{configurable:!0,enumerable:!0,get(){return e.get(t)},set:te,deleteProperty:te}},ownKeys(e){return e.keys()}};function he(e){return(e=typeof e=="function"?e():e)?e:{}}function gt(){for(let e=0,t=this.length;e<t;++e){let r=this[e]();if(r!==void 0)return r}}function Mt(...e){let t=!1;for(let s=0;s<e.length;s++){let u=e[s];t=t||!!u&&se in u,e[s]=typeof u=="function"?(t=!0,A(u)):u}if(t)return new Proxy({get(s){for(let u=e.length-1;u>=0;u--){let o=he(e[u])[s];if(o!==void 0)return o}},has(s){for(let u=e.length-1;u>=0;u--)if(s in he(e[u]))return!0;return!1},keys(){let s=[];for(let u=0;u<e.length;u++)s.push(...Object.keys(he(e[u])));return[...new Set(s)]}},ye);let r={},n={},i=new Set;for(let s=e.length-1;s>=0;s--){let u=e[s];if(!u)continue;let o=Object.getOwnPropertyNames(u);for(let f=0,a=o.length;f<a;f++){let c=o[f];if(c==="__proto__"||c==="constructor")continue;let p=Object.getOwnPropertyDescriptor(u,c);if(!i.has(c))p.get?(i.add(c),Object.defineProperty(r,c,{enumerable:!0,configurable:!0,get:gt.bind(n[c]=[p.get.bind(u)])})):(p.value!==void 0&&i.add(c),r[c]=p.value);else{let w=n[c];w?p.get?w.push(p.get.bind(u)):p.value!==void 0&&w.push(()=>p.value):r[c]===void 0&&(r[c]=p.value)}}}return r}function $t(e,...t){if(se in e){let i=new Set(t.length>1?t.flat():t[0]),s=t.map(u=>new Proxy({get(o){return u.includes(o)?e[o]:void 0},has(o){return u.includes(o)&&o in e},keys(){return u.filter(o=>o in e)}},ye));return s.push(new Proxy({get(u){return i.has(u)?void 0:e[u]},has(u){return i.has(u)?!1:u in e},keys(){return Object.keys(e).filter(u=>!i.has(u))}},ye)),s}let r={},n=t.map(()=>({}));for(let i of Object.getOwnPropertyNames(e)){let s=Object.getOwnPropertyDescriptor(e,i),u=!s.get&&!s.set&&s.enumerable&&s.writable&&s.configurable,o=!1,f=0;for(let a of t)a.includes(i)&&(o=!0,u?n[f][i]=s.value:Object.defineProperty(n[f],i,s)),++f;o||(u?r[i]=s.value:Object.defineProperty(r,i,s))}return[...n,r]}function Lt(e){let t,r,n=i=>{let s=h.context;if(s){let[o,f]=j();h.count||(h.count=0),h.count++,(r||(r=e())).then(a=>{q(s),h.count--,f(()=>a.default),q()}),t=o}else if(!t){let[o]=st(()=>(r||(r=e())).then(f=>f.default));t=o}let u;return A(()=>(u=t())&&O(()=>{if(!s)return u(i);let o=h.context;q(s);let f=u(i);return q(o),f}))};return n.preload=()=>r||((r=e()).then(i=>t=()=>i.default),r),n}var pt=0;function qt(){let e=h.context;return e?`${e.id}${e.count++}`:`cl-${pt++}`}var Be=e=>`Stale read from <${e}>.`;function Rt(e){let t="fallback"in e&&{fallback:()=>e.fallback};return A(dt(()=>e.each,e.children,t||void 0))}function Dt(e){let t="fallback"in e&&{fallback:()=>e.fallback};return A(ht(()=>e.each,e.children,t||void 0))}function Nt(e){let t=e.keyed,r=A(()=>e.when,void 0,{equals:(n,i)=>t?n===i:!n==!i});return A(()=>{let n=r();if(n){let i=e.children;return typeof i=="function"&&i.length>0?O(()=>i(t?n:()=>{if(!O(r))throw Be("Show");return e.when})):i}return e.fallback},void 0,void 0)}function Ut(e){let t=!1,r=(s,u)=>s[0]===u[0]&&(t?s[1]===u[1]:!s[1]==!u[1])&&s[2]===u[2],n=qe(()=>e.children),i=A(()=>{let s=n();Array.isArray(s)||(s=[s]);for(let u=0;u<s.length;u++){let o=s[u].when;if(o)return t=!!s[u].keyed,[u,o,s[u]]}return[-1]},void 0,{equals:r});return A(()=>{let[s,u,o]=i();if(s<0)return e.fallback;let f=o.children;return typeof f=="function"&&f.length>0?O(()=>f(t?u:()=>{if(O(i)[0]!==s)throw Be("Match");return o.when})):f},void 0,void 0)}function Wt(e){return e}var Q;function Ht(){Q&&[...Q].forEach(e=>e())}function _t(e){let t;h.context&&h.load&&(t=h.load(h.context.id+h.context.count));let[r,n]=j(t,void 0);return Q||(Q=new Set),Q.add(n),N(()=>Q.delete(n)),A(()=>{let i;if(i=r()){let s=e.fallback;return typeof s=="function"&&s.length?O(()=>s(i,()=>n())):s}return it(()=>e.children,n)},void 0,void 0)}var wt=(e,t)=>e.showContent===t.showContent&&e.showFallback===t.showFallback,Se=Le();function zt(e){let[t,r]=j(()=>({inFallback:!1})),n,i=Z(Se),[s,u]=j([]);i&&(n=i.register(A(()=>t()().inFallback)));let o=A(f=>{let a=e.revealOrder,c=e.tail,{showContent:p=!0,showFallback:w=!0}=n?n():{},b=s(),T=a==="backwards";if(a==="together"){let x=b.every(C=>!C()),v=b.map(()=>({showContent:x&&p,showFallback:w}));return v.inFallback=!x,v}let S=!1,P=f.inFallback,F=[];for(let x=0,v=b.length;x<v;x++){let C=T?v-x-1:x,$=b[C]();if(!S&&!$)F[C]={showContent:p,showFallback:w};else{let R=!S;R&&(P=!0),F[C]={showContent:R,showFallback:!c||R&&c==="collapsed"?w:!1},S=!0}}return S||(P=!1),F.inFallback=P,F},{inFallback:!1});return r(()=>o),ze(Se.Provider,{value:{register:f=>{let a;return u(c=>(a=c.length,[...c,f])),A(()=>o()[a],void 0,{equals:wt})}},get children(){return e.children}})}function Bt(e){let t=0,r,n,i,s,u,[o,f]=j(!1),a=lt(),c={increment:()=>{++t===1&&f(!0)},decrement:()=>{--t===0&&f(!1)},inFallback:o,effects:[],resolved:!1},p=Me();if(h.context&&h.load){let T=h.context.id+h.context.count,S=h.load(T);if(S&&(typeof S!="object"||!("value"in S))&&(i=S),i&&i!=="$$f"){let[P,F]=j(void 0,{equals:!1});s=P,i.then(()=>{h.gather(T),q(n),F(),q()}).catch(x=>{if(x||h.done)return x&&(u=x),F()})}}let w=Z(Se);w&&(r=w.register(c.inFallback));let b;return N(()=>b&&b()),ze(a.Provider,{value:c,get children(){return A(()=>{if(u)throw u;if(n=h.context,s)return s(),s=void 0;n&&i==="$$f"&&q();let T=A(()=>e.children);return A(S=>{let P=c.inFallback(),{showContent:F=!0,showFallback:x=!0}=r?r():{};if((!P||i&&i!=="$$f")&&F)return c.resolved=!0,b&&b(),b=n=i=void 0,ut(c.effects),T();if(x)return b?S:B(v=>(b=v,n&&(q({id:n.id+"f",count:0}),n=void 0),e.fallback),p)})})}})}var Kt=void 0;export{mt as $DEVCOMP,se as $PROXY,Fe as $TRACK,Kt as DEV,_t as ErrorBoundary,Rt as For,Dt as Index,Wt as Match,Nt as Show,Bt as Suspense,zt as SuspenseList,Ut as Switch,vt as batch,bt as cancelCallback,it as catchError,qe as children,ze as createComponent,Oe as createComputed,Le as createContext,yt as createDeferred,Ve as createEffect,A as createMemo,xt as createReaction,rt as createRenderEffect,st as createResource,B as createRoot,St as createSelector,j as createSignal,qt as createUniqueId,Pt as enableExternalSource,Vt as enableHydration,At as enableScheduling,Pe as equalFn,It as from,Ct as getListener,Me as getOwner,ht as indexArray,Lt as lazy,dt as mapArray,Mt as mergeProps,jt as observable,kt as on,N as onCleanup,Ft as onError,Ot as onMount,Te as requestCallback,Ht as resetErrorBoundaries,Et as runWithOwner,h as sharedConfig,$t as splitProps,$e as startTransition,O as untrack,Z as useContext,Tt as useTransition};
//# sourceMappingURL=solid.js.map