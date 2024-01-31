"use strict";(()=>{var M=Object.defineProperty;var R=(n,u)=>{for(var c in u)M(n,c,{get:u[c],enumerable:!0})};var E={};R(E,{create_report_message:()=>le,delay_sample_point:()=>re,delay_sample_value:()=>ne,forget:()=>oe,infer_concrete_type:()=>Z,report:()=>se,sample_point:()=>ue,sample_value:()=>$,sampled_values:()=>b,turn_type_into_typescript:()=>x});function y(n,u=""){if(!n)throw u==null||typeof u=="boolean"||typeof u=="number"||typeof u=="string"?new Error(`Assertion failed: ${u}`):typeof u=="function"?(u(),new Error("Assertion failed!")):(console.error("Assertion failed:",u),new Error("Assertion failed!"))}function N(n){if(n==null)throw new Error(`Unwrapping violation, value was: ${n}`);return n}function W(n){throw new Error("Exhaustive check violated!")}function q(){throw new Error("Unreachable!")}var b=new Map,I=(()=>{let n=/^[_$A-Za-z]([_$A-Za-z0-9])*$/;function u(c){return c.match(n)!==null}return u})();function B(n=""){throw new Error(`Need to implement: ${n}`)}function U(n){if(n.type==="undefined")return 10;if(n.type==="null")return 20;if(n.type==="undetermined")return 30;if(n.type==="boolean")return 40;if(n.type==="number")return 50;if(n.type==="string")return 60;if(n.type==="circular_reference")return 70;if(n.type==="function")return 80;if(n.type==="arguments")return 89;if(n.type==="tuple")return 90;if(n.type==="array")return 100;if(n.type==="object_unknown")return 110;if(n.type==="object")return 120;if(n.type==="builder")return 130;if(n.type==="intersection")return 140;if(n.type==="union")return 150;W(n)}function V(){return{type:"undetermined"}}function J(n){return{type:"circular_reference",depth:n}}function P(){return{type:"undefined"}}function D(){return{type:"null"}}function G(){return{type:"boolean"}}function H(){return{type:"number"}}function K(){return{type:"string"}}function m(n,u=!1){let c=[];{let r=function(f){if(f.type==="union"){f.optional&&(u=!0);for(let t of f.value)r(t)}else["undetermined","selfref","undefined","null","boolean","number","string","objectunknown"].includes(f.type)?a.has(f.type)||(a.add(f.type),c.push(f)):c.push(f)};var l=r;let a=new Set;for(let f of n)r(f)}{let a=[],r=[],f=[];for(let p=0;p<c.length;p++){let e=c[p];e.type==="tuple"?e.strict?r.push(e):f.push(e):a.push(e)}let t=[];if(r.length>0){let p=r[0];y(p.strict===!0);for(let e=1;e<r.length;e++){let o=r[e];if(y(o.strict===!0),p.value.length===o.value.length)for(let s=0;s<p.value.length;s++){let i=g(p.value[s],o.value[s]);p.value[s]=i}else{let s,i;p.value.length<o.value.length?(s=p,i=o):(s=o,i=p),y(s.value.length<i.value.length,`Tuple a was expected to be larger than tuple b: ${s.value.length} vs ${i.value.length}`),y(s.strict===!0),y(i.strict===!0);let h=[];for(let d=0;d<s.value.length;d++)h.push(g(s.value[d],i.value[d]));for(let d=s.value.length;d<i.value.length;d++)h.push(m([i.value[d]],!0));let _=A(h,!0);y(_.strict===!0),p=_}}y(p.type==="tuple"),y(p.strict===!0),t.push(p)}if(f.length>0){let p=f[0];y(p.strict===!1);for(let e=1;e<f.length;e++){let o=f[e];if(y(o.strict===!1),p.type==="tuple")if(p.value.length===o.value.length){for(let s=0;s<p.value.length;s++){let i=g(p.value[s],o.value[s]);p.value[s]=i}return p}else{let s=[];y(p.strict===!1),y(o.strict===!1);for(let h of p.value)s.push(h);for(let h of o.value)s.push(h);y(s.length>0);let i=s[0];for(let h=1;h<s.length;h++)i=g(i,s[h]);p=v(i)}else if(o.value.length>0){let s=[];for(let h of o.value)s.push(h);let i=p.value;for(let h=0;h<s.length;h++)i=g(i,s[h]);p.value=i}}t.push(p)}c=[...a,...t]}{let a=[],r=[];for(let t=0;t<c.length;t++){let p=c[t];p.type==="tuple"?p.strict?a.push(p):r.push(p):p.type==="array"?r.push(p):a.push(p)}let f=[];if(r.length>0){let t=r[0];for(let p=1;p<r.length;p++){let e=r[p];if(t.type==="tuple"){if(y(!t.strict),e.type==="tuple")if(y(!e.strict),t.value.length===e.value.length)for(let o=0;o<t.value.length;o++)t.value[o]=g(t.value[o],e.value[o]);else{let o=[];for(let i of t.value)o.push(i);for(let i of e.value)o.push(i);y(o.length>0);let s=o[0];for(let i=1;i<o.length;i++)s=g(s,o[i]);t=v(s)}else if(e.type==="array")if(t.value.length>0){let o=e.value;for(let s=0;s<t.value.length;s++)o=g(o,t.value[s]);e.value=o,t=e}else t=e}else if(t.type==="array")if(e.type==="tuple"){if(y(!e.strict),e.value.length>0){let o=t.value;for(let s=0;s<e.value.length;s++)o=g(o,e.value[s]);t.value=o}}else e.type==="array"&&(t.value=g(t.value,e.value))}f.push(t)}c=[...a,...f]}{let a=[],r=[];for(let t of c)t.type==="arguments"?r.push(t):a.push(t);let f=[];if(r.length>0){let t=r[0];for(let p=1;p<r.length;p++){let e=r[p];if(t.value.length===e.value.length)for(let o=0;o<t.value.length;o++){let s=g(t.value[o],e.value[o]);t.value[o]=s}else{let o,s;t.value.length<e.value.length?(o=t,s=e):(o=e,s=t),y(o.value.length<s.value.length,`Arguments a was expected to be larger than arguments b: ${o.value.length} vs ${s.value.length}`);let i=[];for(let _=0;_<o.value.length;_++)i.push(g(o.value[_],s.value[_]));for(let _=o.value.length;_<s.value.length;_++)i.push(m([s.value[_]],!0));t=O(i)}}y(t.type==="arguments"),f.push(t)}c=[...a,...f]}{let a=[],r=[];for(let t of c)t.type==="object"?a.push(t):r.push(t);let f=[];if(a.length>0){let t=a[0];for(let p=1;p<a.length;p++)t=g(t,a[p]);f.push(t)}c=[...r,...f]}{let a=[],r=new Map,f=new Set;for(let p of c)p.type==="builder"?r.has(p.value)||r.set(p.value,p):(p.type==="intersection"&&f.add(p.value[0].value),a.push(p));for(let p of f)r.delete(p);let t=[...r.values()];c=[...a,...t]}{let a=[],r=[];for(let p of c)p.type==="intersection"?a.push(p):r.push(p);a.sort((p,e)=>p.value[0].value.localeCompare(e.value[0].value));let f=[],t=new Map;for(let p of a){let e=p.value[0].value;t.hasOwnProperty(e)||t.set(e,[]),N(t.get(e)).push(p)}for(let p of t.values()){y(p.length>0);let e=p[0];for(let o=1;o<p.length;o++){let s=p[o];y(e.value[0].value===s.value[0].value);let i=g(e,s);y(i.type==="intersection"),e=i}f.push(e)}c=[...r,...f]}{let a=[],r=[];for(let t of c)t.type==="function"?a.push(t):r.push(t);a.sort((t,p)=>t.number_of_arguments-p.number_of_arguments);let f=[];{let t=null;for(let p=0;p<a.length;p++){let e=a[p];t===null?t=e:t.number_of_arguments!==e.number_of_arguments&&(f.push(t),t=e)}t!==null&&(f.push(t),t=null)}c=[...r,...f]}if(y(c.length>=1),c.sort((a,r)=>{let f=U(a),t=U(r);return f-t}),c.length===1&&!u){let a=c[0];return y(a.hasOwnProperty("type")),a}else return{type:"union",value:c,optional:u}}function L(n){return y(n.length===2),y(n[0].type==="builder"),{type:"intersection",value:n}}function A(n,u=!1){return{type:"tuple",value:n,strict:u}}function O(n){return{type:"arguments",value:n}}function v(n){return{type:"array",value:n}}function k(n){let u={};for(let c of n){let[l,a]=c;u[l]=a}return{type:"object",value:u}}function Q(){return{type:"object_unknown"}}function j(n,u,c){let l=[];for(let r=0;r<n;r++)l.push(r);if(u!==void 0)for(let r=0;r<u.length;r++)l[r]=u[r];return{type:"function",number_of_arguments:n,mandatory_number_of_arguments:c??n,parameter_names:l}}function w(n){return{type:"builder",value:n}}var X=/^[A-Z]/,Y=/\((?<params>\s*\w+(,\s*\w+)*)\)/;function ee(n){return n===null?!1:typeof n=="object"?!0:typeof n=="function"}function S(n){let c=(""+n).match(Y);if(c!==null){let l=c.groups;if(l!==void 0){let a=l.params;return typeof a!="string"?void 0:a.split(",").map(f=>[f.trim()])}else return}else return}function Z(n,u){let c=[];function l(r,f,t){let p=ee(r);if(p){let o=c.indexOf(r);if(o>=0){let s=c.length;return J(o-s)}c.push(r)}let e;if(r===void 0)e=P();else if(r===null)e=D();else if(typeof r=="boolean")e=G();else if(typeof r=="number")e=H();else if(typeof r=="string")e=K();else if(Object.prototype.toString.call(r)==="[object Arguments]"){if(f>=t)return p&&c.pop(),v(V());let o=[];for(let s=0;s<r.length;s++){let i=r[s];o.push(l(i,f+1,t))}e=O(o)}else if(Array.isArray(r)){if(f>=t)return p&&c.pop(),v(V());if(u&&u.experimentalInterpretArrayAsArray)if(r.length===0)e=v(V());else{let o=[];for(let i of r)o.push(l(i,f+1,t));let s=o[0];for(let i=1;i<o.length;i++)s=g(s,o[i]);e=v(s)}else{let o=[];for(let s of r)o.push(l(s,f+1,t));e=A(o,!1)}}else if(typeof r=="function")if(r.name)if(r.name.match(X)!==null)e=w(r.name);else{let o=S(r);e=j(r.length,o)}else{let o=S(r);e=j(r.length,o)}else{let o="";if(r&&r.constructor&&(o=r.constructor.name),f>=t)return p&&c.pop(),o==="Object"?Q():w(o);if(["Object"].includes(o)){let s=Object.keys(r);s.sort();let i=[];for(let h of s){let _=r[h],d=l(_,f+1,t);i.push([h,d])}e=k(i)}else{let s=Object.keys(r);s.sort();let i=[];for(let _ of s){let d=r[_],F=l(d,f+1,f+1);i.push([_,F])}let h=k(i);o.length>0&&o!=="Object"&&(h=L([w(o),h])),e=h}}return p&&c.pop(),e}let a=l(n,0,1/0);return y(c.length===0,"We didn't pop off all the values off of the circular reference detector stack."),y(a!==void 0,"We expected to get some concrete type, not undefined."),y(a!==null,"We expected to get some concrete type, not null."),a}function g(n,u){if(n.type==="undefined")return u.type==="undefined"?n:m([n,u]);if(n.type==="undetermined")return u.type==="undetermined"?n:u;if(n.type==="null")return u.type==="null"?n:m([n,u]);if(n.type==="boolean")return u.type==="boolean"?n:m([n,u]);if(n.type==="number")return u.type==="number"?n:m([n,u]);if(n.type==="string")return u.type==="string"?n:m([n,u]);if(n.type==="circular_reference")return u.type==="circular_reference"?n:m([n,u]);if(n.type==="union")return m([n,u]);if(n.type==="arguments"){if(console.log({t1:n,t2:u}),u.type!=="arguments")return m([n,u]);if(n.value.length===u.value.length){for(let l=0;l<n.value.length;l++)n.value[l]=g(n.value[l],u.value[l]);return n}else{let l,a;n.value.length<u.value.length?(l=n,a=u):(l=u,a=n),y(l.value.length<a.value.length,`Arguments a was expected to be larger than Arguments b: ${l.value.length} vs ${a.value.length}`);let r=[];for(let t=0;t<l.value.length;t++)r.push(g(l.value[t],a.value[t]));for(let t=l.value.length;t<a.value.length;t++)r.push(m([a.value[t]],!0));return O(r)}}else if(n.type==="tuple")if(u.type==="tuple")if(n.strict&&u.strict)if(n.value.length===u.value.length){for(let l=0;l<n.value.length;l++)n.value[l]=g(n.value[l],u.value[l]);return y(n.strict===!0),n}else{let l,a;n.value.length<u.value.length?(l=n,a=u):(l=u,a=n),y(l.value.length<a.value.length,`Tuple a was expected to be larger than tuple b: ${l.value.length} vs ${a.value.length}`);let r=[];for(let t=0;t<l.value.length;t++)r.push(g(l.value[t],a.value[t]));for(let t=l.value.length;t<a.value.length;t++)r.push(m([a.value[t]],!0));let f=A(r,!0);return y(f.strict===!0),f}else{if(n.strict||u.strict)return y(n.strict&&!u.strict||!n.strict&&u.strict),m([n,u]);if(y(!n.strict),y(!u.strict),n.value.length===u.value.length){for(let l=0;l<n.value.length;l++)n.value[l]=g(n.value[l],u.value[l]);return y(!n.strict),n}else{let l=[];for(let r of n.value)l.push(r);for(let r of u.value)l.push(r);y(l.length>0);let a=l[0];for(let r=1;r<l.length;r++)a=g(a,l[r]);return v(a)}}else if(u.type==="array"){if(n.strict)return y(n.strict===!0),m([n,u]);{if(n.value.length===0)return u;let l=[];for(let r of n.value)l.push(r);let a=u.value;for(let r=0;r<l.length;r++)a=g(a,l[r]);return u.value=a,u}}else return m([n,u]);else if(n.type==="array"){if(u.type==="array")return n.value=g(n.value,u.value),n;if(u.type==="tuple"){if(u.strict)return m([n,u]);{if(u.value.length===0)return n;let l=[];for(let r of u.value)l.push(r);let a=n.value;for(let r=0;r<l.length;r++)a=g(a,l[r]);return n.value=a,n}}else return m([n,u])}else if(n.type==="object")if(u.type==="object"){let l=new Set(Object.keys(n.value)),a=new Set(Object.keys(u.value)),r=new Set;for(let p of l)a.has(p)&&(r.add(p),l.delete(p),a.delete(p));let f=[];for(let p of r)f.push([p,g(n.value[p],u.value[p])]);for(let p of l)f.push([p,m([n.value[p]],!0)]);for(let p of a)f.push([p,m([u.value[p]],!0)]);return f.sort((p,e)=>p[0].localeCompare(e[0])),k(f)}else return m([n,u]);else{if(n.type==="object_unknown")return u.type==="object_unknown"?n:m([n,u]);if(n.type==="builder")return u.type==="builder"&&u.value===n.value?n:m([n,u]);if(n.type==="intersection")if(u.type==="intersection")if(y(n.value[0].type==="builder"),y(n.value[1].type!=="builder"),y(u.value[0].type==="builder"),y(u.value[1].type!=="builder"),n.value[0].value===u.value[0].value){let l=g(n.value[1],u.value[1]);return n.value[1]=l,n}else return m([n,u]);else return m([n,u]);else if(n.type==="function")if(u.type==="function"){let p=function(e){for(let o=0;o<e.parameter_names.length;o++){let s=e.parameter_names[o];if(typeof s=="number")continue;let i=t[o];if(typeof i=="number")t[o]=s;else{let h=[...new Set([...i,...s])];h.sort(),t[o]=h}}};var c=p;let l=Math.min(n.mandatory_number_of_arguments,u.mandatory_number_of_arguments),a=Math.max(n.mandatory_number_of_arguments,u.mandatory_number_of_arguments),r=n,f=u;if(r.number_of_arguments>f.number_of_arguments){let e=r;r=f,f=e}y(r.number_of_arguments<=f.number_of_arguments);let t=[];for(let e=0;e<a;e++)t.push(e);return p(n),p(u),j(a,t,l)}else return m([n,u]);else console.log(n.type),B("combine_type: unhandled type: "+n.type)}q()}function $(n,u,c){let l=Z(u,c);y(l!==null&&typeof l=="object");let a;if(b.has(n)){let r=N(b.get(n));r=g(r,l),y(r!==null&&typeof r=="object"),a=r,b.set(n,r)}else b.set(n,l),a=l;return y(a!==void 0),y(a!==null&&typeof a=="object"),a}function ne(n,u,c){T.push({name:n,value:u,inference_options:c})}var te=(()=>{let n=/\d+:\d+$/,u=/([A-Za-z]([A-Za-z0-9+.-])*:\/\/.+?:\d+:\d+)/,c=/(<anonymous>:\d+:\d+)/,l=/([A-Za-z]([A-Za-z0-9+.-])*:\\.+?:\d+\d+)/,a=/(.+\/)*.+:\d+:\d+/,r=/([A-Za-z]([A-Za-z0-9+.-])*:\/\/.+?:\d+:\d+)$/,f=/@(?<location>debugger eval code:\d+:\d+)/;function t(p){let e=[],o=p.split(`
`).map(s=>s.trim()).filter(s=>s.length>0);if(o.length===0)return e;if(["Error","Error:"].includes(o[0])){o.shift(),o=o.map(s=>s.substring(3));for(let s of o)if(s[s.length-1]===")"){let i=s.indexOf("("),h=s.lastIndexOf(")");if(s=s.substring(i+1,h),s.match(n)){e.push(s);continue}else{e.push(null);continue}}else{let i;if(i=s.match(u),i!==null){e.push(i[0]);continue}if(i=s.match(c),i!==null){e.push(i[0]);continue}if(i=s.match(l),i!==null){e.push(i[0]);continue}if(i=s.match(a),i!==null){e.push(i[0]);continue}throw console.log(`Stack:
`+p),new Error("Unable to handle: ["+s+"]")}}else for(let s of o){let i;if(i=s.match(r),i!==null){e.push(i[0]);continue}if(i=s.match(f),i!==null){y(i.groups!==void 0),y(typeof i.groups.location=="string"),e.push(i.groups.location);continue}throw console.log(`Stack:
`+p),new Error("Unable to handle: ["+s+"]")}return e}return t})();function z(n){let c=new Error().stack;if(c===void 0)throw new Error("Error stack may not be undefined.");let a=te(c)[n];return y(a!==void 0),y(a!==null),a}var T=[];function ue(n,u){let c=z(2);return $(c,n,u)}function re(n,u){let c=z(2);T.push({name:c,value:n,inference_options:u})}function C(){let n=T.length;for(let u=0;u<n;u++){let c=T[u],{name:l,value:a,inference_options:r}=c;$(l,a,r)}for(;T.length>0;)T.pop()}function x(n,u){let c="  ",l=!0;u!==void 0&&(u.ident!==void 0&&(c=u.ident),u.fmt!==void 0&&(l=u.fmt));function a(f,t,p){y(n!=null);let e=[];if(t.type==="undefined")e.push("undefined");else if(t.type==="undetermined")e.push("unknown");else if(t.type==="null")e.push("null");else if(t.type==="boolean")e.push("boolean");else if(t.type==="number")e.push("number");else if(t.type==="string")e.push("string");else if(t.type==="circular_reference")e.push(`CircularReference<${t.depth}>`);else if(t.type==="builder")e.push(t.value);else if(t.type==="arguments")if(t.value.length===0)e.push("Args<{}>)");else if(t.value.length===1){e.push("Args<{"),l&&e.push(" ");for(let o=0;o<t.value.length;o++){let s=t.value[o];e.push(`p${o+1}`),s.type==="union"&&s.optional?e.push("?:"):e.push(":"),l&&e.push(" "),e.push(a(f,s,!1)),e.push(","),l&&e.push(" ")}l&&e.pop(),e.pop(),l&&e.push(" "),e.push("}>")}else{e.push("Args<{"),l&&e.push(`
`);for(let o=0;o<t.value.length;o++){let s=t.value[o];l&&e.push(c.repeat(f+1)),e.push(`p${o+1}`),s.type==="union"&&s.optional?e.push("?:"):e.push(":"),l&&e.push(" "),e.push(a(f+1,s,!1)),e.push(","),l&&e.push(`
`)}l&&e.pop(),e.pop(),l&&e.push(`
`),l&&e.push(c.repeat(f)),e.push("}>")}else if(t.type==="tuple")if(t.value.length===0)e.push("[]");else if(t.value.length===1)e.push("["),t.value[0].type==="union"&&y(!t.value[0].optional),e.push(a(f,t.value[0],!1)),e.push("]");else{if(e.push("["),l&&e.push(`
`),t.value.length>0){for(let o of t.value)o.type==="union"&&y(!o.optional),l&&e.push(c.repeat(f+1)),e.push(a(f+1,o,!1)),e.push(","),l&&e.push(`
`);l&&e.pop(),e.pop(),l&&e.push(`
`)}l&&e.push(c.repeat(f)),e.push("]")}else if(t.type==="array"){let o=t.value.type==="union"||t.value.type==="intersection";o&&e.push("("),t.value.type==="union"&&y(!t.value.optional),e.push(a(f,t.value,!1)),o&&e.push(")"),e.push("[]")}else if(t.type==="object"){let o=Object.keys(t.value);if(o.sort(),o.length===0)e.push("{}");else if(o.length===1){e.push("{"),l&&e.push(" ");for(let s of o){let i=t.value[s];I(s)?e.push(s):e.push(JSON.stringify(s)),i.type==="union"&&i.optional?e.push("?:"):e.push(":"),l&&e.push(" "),e.push(a(f,i,!1)),e.push(","),l&&e.push(" ")}l&&e.pop(),e.pop(),l&&e.push(" "),e.push("}")}else{e.push("{"),l&&e.push(`
`);for(let s of o){let i=t.value[s];l&&e.push(c.repeat(f+1)),I(s)?e.push(s):e.push(JSON.stringify(s)),i.type==="union"&&i.optional?e.push("?:"):e.push(":"),l&&e.push(" "),e.push(a(f+1,i,!1)),e.push(","),l&&e.push(`
`)}l&&e.pop(),e.pop(),l&&e.push(`
`),l&&e.push(c.repeat(f)),e.push("}")}}else if(t.type==="object_unknown")l?e.push("{ [key: string]: unknown }"):e.push("{[key:string]:unknown}");else if(t.type==="union"){for(let o of t.value)e.push(a(f,o,!0)),l&&e.push(" "),e.push("|"),l&&e.push(" ");l&&e.pop(),e.pop(),l&&e.pop()}else if(t.type==="function"){let o=t.number_of_arguments;if(p&&e.push("("),e.push("("),o>0){let s=t.number_of_arguments,i=t.mandatory_number_of_arguments;y(i<=s),y(t.parameter_names.length===s);for(let h=0;h<s;h++){let _=t.parameter_names[h];typeof _=="number"?e.push(`p${_+1}`):e.push(_.join("_or_")),h>=i&&e.push("?"),e.push(":"),l&&e.push(" "),e.push("unknown"),e.push(","),l&&e.push(" ")}l&&e.pop(),e.pop()}e.push(")"),l&&e.push(" "),e.push("=>"),l&&e.push(" "),e.push("unknown"),p&&e.push(")")}else if(t.type==="intersection"){let o=t.value[0],s=t.value[1];s.type==="object"&&Object.keys(s.value).length===0?e.push(a(f,o,!0)):(e.push(a(f,o,!0)),l&&e.push(" "),e.push("&"),l&&e.push(" "),e.push(a(f,s,!0)))}else console.log("(turn_type_into_typescript) Unknown type value:",t),B(`(turn_type_into_typescript) Need to implement type value type: ${t.type}`);return e.join("")}return a(0,n,!1)}function le(){C();let n=[],u=0;for(let l of b.entries()){let a=l[0],r=l[1];n.push("// "+a+`:
`),n.push(`type T${u} = `),n.push(x(r)+`;
`),n.push(`
`),u+=1}return n.length>0&&n.pop(),n.join("")}function se(n=!1){C(),n&&console.clear();let u=0;for(let c of b.entries()){let l=c[0],a=c[1],r=[];r.push("// "+l+`
`),r.push(`type T${u} = `),r.push(x(a)+`;
`),r.push(`
`),console.log(r.join("")),u+=1}}function oe(){b.clear()}globalThis.rti=E;})();
