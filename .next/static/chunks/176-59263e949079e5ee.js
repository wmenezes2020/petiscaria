(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[176],{62898:function(e,t,r){"use strict";r.d(t,{Z:function(){return i}});var o=r(2265),a={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),i=(e,t)=>{let r=(0,o.forwardRef)(({color:r="currentColor",size:i=24,strokeWidth:n=2,absoluteStrokeWidth:l,className:c="",children:d,...u},p)=>(0,o.createElement)("svg",{ref:p,...a,width:i,height:i,stroke:r,strokeWidth:l?24*Number(n)/Number(i):n,className:["lucide",`lucide-${s(e)}`,c].join(" "),...u},[...t.map(([e,t])=>(0,o.createElement)(e,t)),...Array.isArray(d)?d:[d]]));return r.displayName=`${e}`,r}},98253:function(e,t,r){"use strict";r.d(t,{Z:function(){return o}});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let o=(0,r(62898).Z)("Building2",[["path",{d:"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",key:"1b4qmf"}],["path",{d:"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",key:"i71pzd"}],["path",{d:"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",key:"10jefs"}],["path",{d:"M10 6h4",key:"1itunk"}],["path",{d:"M10 10h4",key:"tcdvrf"}],["path",{d:"M10 14h4",key:"kelpxr"}],["path",{d:"M10 18h4",key:"1ulq68"}]])},77216:function(e,t,r){"use strict";r.d(t,{Z:function(){return o}});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let o=(0,r(62898).Z)("EyeOff",[["path",{d:"M9.88 9.88a3 3 0 1 0 4.24 4.24",key:"1jxqfv"}],["path",{d:"M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68",key:"9wicm4"}],["path",{d:"M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61",key:"1jreej"}],["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}]])},99670:function(e,t,r){"use strict";r.d(t,{Z:function(){return o}});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let o=(0,r(62898).Z)("Eye",[["path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",key:"rwhkz3"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]])},5589:function(e,t,r){"use strict";r.d(t,{Z:function(){return o}});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let o=(0,r(62898).Z)("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]])},1295:function(e,t,r){"use strict";r.d(t,{Z:function(){return o}});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let o=(0,r(62898).Z)("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]])},97024:function(e,t,r){"use strict";r.d(t,{t:function(){return l}});var o=r(94660),a=r(74810),s=r(58222);let i=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t));let r=JSON.stringify(t);document.cookie="".concat(e,"=").concat(encodeURIComponent(r),"; path=/; max-age=").concat(604800,"; SameSite=Lax")}catch(e){console.error("Erro ao salvar no storage:",e)}},n=e=>{try{let t=localStorage.getItem(e);return t?JSON.parse(t):null}catch(e){return console.error("Erro ao ler do storage:",e),null}},l=(0,o.Ue)()((0,a.tJ)((e,t)=>({user:null,accessToken:null,refreshToken:null,isAuthenticated:!1,isLoading:!1,error:null,login:async(t,r,o)=>{try{e({isLoading:!0,error:null});let{accessToken:a,refreshToken:n,user:l}=(await s.hi.post("/auth/login",{email:t,password:r,companyId:o})).data;console.log("\uD83D\uDD10 Dados de login recebidos:",{accessToken:!!a,refreshToken:!!n,user:l}),s.hi.defaults.headers.common.Authorization="Bearer ".concat(a),e({user:l,accessToken:a,refreshToken:n,isAuthenticated:!0,isLoading:!1,error:null}),console.log("\uD83D\uDD10 Estado atualizado com sucesso"),i("auth-storage",{user:l,accessToken:a,refreshToken:n,isAuthenticated:!0}),await new Promise(e=>setTimeout(e,0))}catch(r){var a,n;let t=(null===(n=r.response)||void 0===n?void 0:null===(a=n.data)||void 0===a?void 0:a.message)||"Erro ao fazer login";throw e({isLoading:!1,error:t,isAuthenticated:!1}),Error(t)}},register:async t=>{try{e({isLoading:!0,error:null});let{accessToken:r,refreshToken:o,user:a}=(await s.hi.post("/auth/register",t)).data;s.hi.defaults.headers.common.Authorization="Bearer ".concat(r),e({user:a,accessToken:r,refreshToken:o,isAuthenticated:!0,isLoading:!1,error:null}),await new Promise(e=>setTimeout(e,0))}catch(a){var r,o;let t=(null===(o=a.response)||void 0===o?void 0:null===(r=o.data)||void 0===r?void 0:r.message)||"Erro ao fazer cadastro";throw e({isLoading:!1,error:t,isAuthenticated:!1}),Error(t)}},logout:()=>{delete s.hi.defaults.headers.common.Authorization,e({user:null,accessToken:null,refreshToken:null,isAuthenticated:!1,isLoading:!1,error:null}),i("auth-storage",{user:null,accessToken:null,refreshToken:null,isAuthenticated:!1})},refreshAccessToken:async()=>{try{let{refreshToken:r}=t();if(!r)throw Error("Token de refresh n\xe3o encontrado");let{accessToken:o}=(await s.hi.post("/auth/refresh",{refreshToken:r})).data;e({accessToken:o,isAuthenticated:!0}),s.hi.defaults.headers.common.Authorization="Bearer ".concat(o)}catch(e){throw t().logout(),e}},clearError:()=>{e({error:null})},setLoading:t=>{e({isLoading:t})},checkAuthStatus:()=>{let r=t();console.log("\uD83D\uDD0D Verificando status de autentica\xe7\xe3o:",{isAuthenticated:r.isAuthenticated,hasUser:!!r.user,hasToken:!!r.accessToken});let o=n("auth-storage");console.log("\uD83D\uDCE6 Dados armazenados:",o),o&&o.accessToken&&!r.accessToken&&(console.log("\uD83D\uDD04 Restaurando dados do storage"),e({user:o.user,accessToken:o.accessToken,refreshToken:o.refreshToken,isAuthenticated:o.isAuthenticated}),o.accessToken&&(s.hi.defaults.headers.common.Authorization="Bearer ".concat(o.accessToken))),r.accessToken&&!r.isAuthenticated&&(console.log("\uD83D\uDD27 Corrigindo estado de autentica\xe7\xe3o"),e({isAuthenticated:!0}))}}),{name:"auth-storage",partialize:e=>({user:e.user,accessToken:e.accessToken,refreshToken:e.refreshToken,isAuthenticated:e.isAuthenticated})}))},24033:function(e,t,r){e.exports=r(15313)},5925:function(e,t,r){"use strict";let o,a;r.r(t),r.d(t,{CheckmarkIcon:function(){return G},ErrorIcon:function(){return q},LoaderIcon:function(){return V},ToastBar:function(){return en},ToastIcon:function(){return et},Toaster:function(){return eu},default:function(){return ep},resolveValue:function(){return D},toast:function(){return I},useToaster:function(){return H},useToasterStore:function(){return j}});var s,i=r(2265);let n={data:""},l=e=>"object"==typeof window?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||n,c=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,d=/\/\*[^]*?\*\/|  +/g,u=/\n+/g,p=(e,t)=>{let r="",o="",a="";for(let s in e){let i=e[s];"@"==s[0]?"i"==s[1]?r=s+" "+i+";":o+="f"==s[1]?p(i,s):s+"{"+p(i,"k"==s[1]?"":t)+"}":"object"==typeof i?o+=p(i,t?t.replace(/([^,])+/g,e=>s.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):s):null!=i&&(s=/^--/.test(s)?s:s.replace(/[A-Z]/g,"-$&").toLowerCase(),a+=p.p?p.p(s,i):s+":"+i+";")}return r+(t&&a?t+"{"+a+"}":a)+o},f={},h=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+h(e[r]);return t}return e},m=(e,t,r,o,a)=>{var s;let i=h(e),n=f[i]||(f[i]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(i));if(!f[n]){let t=i!==e?e:(e=>{let t,r,o=[{}];for(;t=c.exec(e.replace(d,""));)t[4]?o.shift():t[3]?(r=t[3].replace(u," ").trim(),o.unshift(o[0][r]=o[0][r]||{})):o[0][t[1]]=t[2].replace(u," ").trim();return o[0]})(e);f[n]=p(a?{["@keyframes "+n]:t}:t,r?"":"."+n)}let l=r&&f.g?f.g:null;return r&&(f.g=f[n]),s=f[n],l?t.data=t.data.replace(l,s):-1===t.data.indexOf(s)&&(t.data=o?s+t.data:t.data+s),n},g=(e,t,r)=>e.reduce((e,o,a)=>{let s=t[a];if(s&&s.call){let e=s(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;s=t?"."+t:e&&"object"==typeof e?e.props?"":p(e,""):!1===e?"":e}return e+o+(null==s?"":s)},"");function y(e){let t=this||{},r=e.call?e(t.p):e;return m(r.unshift?r.raw?g(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,l(t.target),t.g,t.o,t.k)}y.bind({g:1});let v,b,k,x=y.bind({k:1});function w(e,t){let r=this||{};return function(){let o=arguments;function a(s,i){let n=Object.assign({},s),l=n.className||a.className;r.p=Object.assign({theme:b&&b()},n),r.o=/ *go\d+/.test(l),n.className=y.apply(r,o)+(l?" "+l:""),t&&(n.ref=i);let c=e;return e[0]&&(c=n.as||e,delete n.as),k&&c[0]&&k(n),v(c,n)}return t?t(a):a}}var E=e=>"function"==typeof e,D=(e,t)=>E(e)?e(t):e,A=(o=0,()=>(++o).toString()),T=()=>{if(void 0===a&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");a=!e||e.matches}return a},z=(e,t)=>{switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,20)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return z(e,{type:e.toasts.find(e=>e.id===r.id)?1:0,toast:r});case 3:let{toastId:o}=t;return{...e,toasts:e.toasts.map(e=>e.id===o||void 0===o?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let a=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+a}))}}},$=[],L={toasts:[],pausedAt:void 0},C=e=>{L=z(L,e),$.forEach(e=>{e(L)})},N={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},j=(e={})=>{let[t,r]=(0,i.useState)(L),o=(0,i.useRef)(L);(0,i.useEffect)(()=>(o.current!==L&&r(L),$.push(r),()=>{let e=$.indexOf(r);e>-1&&$.splice(e,1)}),[]);let a=t.toasts.map(t=>{var r,o,a;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(o=e[t.type])?void 0:o.duration)||(null==e?void 0:e.duration)||N[t.type],style:{...e.style,...null==(a=e[t.type])?void 0:a.style,...t.style}}});return{...t,toasts:a}},M=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||A()}),O=e=>(t,r)=>{let o=M(t,e,r);return C({type:2,toast:o}),o.id},I=(e,t)=>O("blank")(e,t);I.error=O("error"),I.success=O("success"),I.loading=O("loading"),I.custom=O("custom"),I.dismiss=e=>{C({type:3,toastId:e})},I.remove=e=>C({type:4,toastId:e}),I.promise=(e,t,r)=>{let o=I.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let a=t.success?D(t.success,e):void 0;return a?I.success(a,{id:o,...r,...null==r?void 0:r.success}):I.dismiss(o),e}).catch(e=>{let a=t.error?D(t.error,e):void 0;a?I.error(a,{id:o,...r,...null==r?void 0:r.error}):I.dismiss(o)}),e};var Z=(e,t)=>{C({type:1,toast:{id:e,height:t}})},S=()=>{C({type:5,time:Date.now()})},P=new Map,_=1e3,B=(e,t=_)=>{if(P.has(e))return;let r=setTimeout(()=>{P.delete(e),C({type:4,toastId:e})},t);P.set(e,r)},H=e=>{let{toasts:t,pausedAt:r}=j(e);(0,i.useEffect)(()=>{if(r)return;let e=Date.now(),o=t.map(t=>{if(t.duration===1/0)return;let r=(t.duration||0)+t.pauseDuration-(e-t.createdAt);if(r<0){t.visible&&I.dismiss(t.id);return}return setTimeout(()=>I.dismiss(t.id),r)});return()=>{o.forEach(e=>e&&clearTimeout(e))}},[t,r]);let o=(0,i.useCallback)(()=>{r&&C({type:6,time:Date.now()})},[r]),a=(0,i.useCallback)((e,r)=>{let{reverseOrder:o=!1,gutter:a=8,defaultPosition:s}=r||{},i=t.filter(t=>(t.position||s)===(e.position||s)&&t.height),n=i.findIndex(t=>t.id===e.id),l=i.filter((e,t)=>t<n&&e.visible).length;return i.filter(e=>e.visible).slice(...o?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+a,0)},[t]);return(0,i.useEffect)(()=>{t.forEach(e=>{if(e.dismissed)B(e.id,e.removeDelay);else{let t=P.get(e.id);t&&(clearTimeout(t),P.delete(e.id))}})},[t]),{toasts:t,handlers:{updateHeight:Z,startPause:S,endPause:o,calculateOffset:a}}},F=x`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,R=x`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,U=x`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,q=w("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${F} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${R} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${U} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,J=x`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,V=w("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${J} 1s linear infinite;
`,W=x`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,Y=x`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,G=w("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${W} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${Y} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,K=w("div")`
  position: absolute;
`,Q=w("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,X=x`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,ee=w("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${X} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,et=({toast:e})=>{let{icon:t,type:r,iconTheme:o}=e;return void 0!==t?"string"==typeof t?i.createElement(ee,null,t):t:"blank"===r?null:i.createElement(Q,null,i.createElement(V,{...o}),"loading"!==r&&i.createElement(K,null,"error"===r?i.createElement(q,{...o}):i.createElement(G,{...o})))},er=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,eo=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,ea=w("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,es=w("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,ei=(e,t)=>{let r=e.includes("top")?1:-1,[o,a]=T()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[er(r),eo(r)];return{animation:t?`${x(o)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${x(a)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},en=i.memo(({toast:e,position:t,style:r,children:o})=>{let a=e.height?ei(e.position||t||"top-center",e.visible):{opacity:0},s=i.createElement(et,{toast:e}),n=i.createElement(es,{...e.ariaProps},D(e.message,e));return i.createElement(ea,{className:e.className,style:{...a,...r,...e.style}},"function"==typeof o?o({icon:s,message:n}):i.createElement(i.Fragment,null,s,n))});s=i.createElement,p.p=void 0,v=s,b=void 0,k=void 0;var el=({id:e,className:t,style:r,onHeightUpdate:o,children:a})=>{let s=i.useCallback(t=>{if(t){let r=()=>{o(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,o]);return i.createElement("div",{ref:s,className:t,style:r},a)},ec=(e,t)=>{let r=e.includes("top"),o=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:T()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...r?{top:0}:{bottom:0},...o}},ed=y`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,eu=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:o,children:a,containerStyle:s,containerClassName:n})=>{let{toasts:l,handlers:c}=H(r);return i.createElement("div",{id:"_rht_toaster",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...s},className:n,onMouseEnter:c.startPause,onMouseLeave:c.endPause},l.map(r=>{let s=r.position||t,n=ec(s,c.calculateOffset(r,{reverseOrder:e,gutter:o,defaultPosition:t}));return i.createElement(el,{id:r.id,key:r.id,onHeightUpdate:c.updateHeight,className:r.visible?ed:"",style:n},"custom"===r.type?D(r.message,r):a?a(r):i.createElement(en,{toast:r,position:s}))}))},ep=I}}]);