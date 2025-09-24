import{a5 as w,a as d,r as o,j as v,l as C,p as g}from"./index-Br6oVQ4F.js";const y="https://edutizimbackend-production.up.railway.app",n=w.create({baseURL:y,headers:{"Content-Type":"application/json"},timeout:1e4});n.interceptors.request.use(e=>{const{accessToken:t}=d.getState().auth;return t&&(e.headers.Authorization=`Bearer ${t}`),e},e=>Promise.reject(e));n.interceptors.response.use(e=>e,e=>(e.response?.status===401&&d.getState().auth.reset(),Promise.reject(e)));const A={SUPER_ADMIN_ENDPOINT:"/api/v1/auth/super-admin/login"},k={login:async e=>(await n.post(A.SUPER_ADMIN_ENDPOINT,e)).data,verifyToken:async()=>(await n.get("/api/v1/auth/verify")).data,logout:async()=>{await n.post("/api/v1/auth/logout")}};var E=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","select","span","svg","ul"],I=E.reduce((e,t)=>{const r=C(`Primitive.${t}`),s=o.forwardRef((i,a)=>{const{asChild:u,...c}=i,p=u?r:t;return typeof window<"u"&&(window[Symbol.for("radix-ui")]=!0),v.jsx(p,{...c,ref:a})});return s.displayName=`Primitive.${t}`,{...e,[t]:s}},{});function R(e,t){e&&g.flushSync(()=>e.dispatchEvent(t))}/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),b=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,r,s)=>s?s.toUpperCase():r.toLowerCase()),l=e=>{const t=b(e);return t.charAt(0).toUpperCase()+t.slice(1)},m=(...e)=>e.filter((t,r,s)=>!!t&&t.trim()!==""&&s.indexOf(t)===r).join(" ").trim(),x=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var N={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=o.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:s,className:i="",children:a,iconNode:u,...c},p)=>o.createElement("svg",{ref:p,...N,width:t,height:t,stroke:e,strokeWidth:s?Number(r)*24/Number(t):r,className:m("lucide",i),...!a&&!x(c)&&{"aria-hidden":"true"},...c},[...u.map(([h,f])=>o.createElement(h,f)),...Array.isArray(a)?a:[a]]));/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=(e,t)=>{const r=o.forwardRef(({className:s,...i},a)=>o.createElement(S,{ref:a,iconNode:t,className:m(`lucide-${P(l(e))}`,`lucide-${e}`,s),...i}));return r.displayName=l(e),r};export{I as P,k as a,n as b,D as c,R as d};
