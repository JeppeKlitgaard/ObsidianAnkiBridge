"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[231],{3905:function(e,n,t){t.d(n,{Zo:function(){return u},kt:function(){return d}});var r=t(7294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var c=r.createContext({}),s=function(e){var n=r.useContext(c),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},u=function(e){var n=s(e.components);return r.createElement(c.Provider,{value:n},e.children)},p={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},m=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,i=e.originalType,c=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),m=s(t),d=a,g=m["".concat(c,".").concat(d)]||m[d]||p[d]||i;return t?r.createElement(g,o(o({ref:n},u),{},{components:t})):r.createElement(g,o({ref:n},u))}));function d(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var i=t.length,o=new Array(i);o[0]=m;var l={};for(var c in n)hasOwnProperty.call(n,c)&&(l[c]=n[c]);l.originalType=e,l.mdxType="string"==typeof e?e:a,o[1]=l;for(var s=2;s<i;s++)o[s]=t[s];return r.createElement.apply(null,o)}return r.createElement.apply(null,t)}m.displayName="MDXCreateElement"},5014:function(e,n,t){t.r(n),t.d(n,{frontMatter:function(){return l},contentTitle:function(){return c},metadata:function(){return s},toc:function(){return u},default:function(){return m}});var r=t(7462),a=t(3366),i=(t(7294),t(3905)),o=["components"],l={},c="\ud83d\udea6 Migrations",s={unversionedId:"migrations",id:"migrations",title:"\ud83d\udea6 Migrations",description:"Since AnkiBridge is still in its relative infancy, breaking changes may",source:"@site/docs/70-migrations.md",sourceDirName:".",slug:"/migrations",permalink:"/ObsidianAnkiBridge/migrations",editUrl:"https://github.com/JeppeKlitgaard/ObsidianAnkiBridge/tree/master/docs/docs/70-migrations.md",tags:[],version:"current",sidebarPosition:70,frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"\u26a0 Gotchas",permalink:"/ObsidianAnkiBridge/gotchas"},next:{title:"\ud83d\udc8c Acknowledgement",permalink:"/ObsidianAnkiBridge/acknowledgement"}},u=[{value:"Future migrations",id:"future-migrations",children:[],level:2},{value:"Migrations",id:"migrations",children:[{value:"<code>0.4.x \u27f6 0.5.x</code>",id:"04x--05x",children:[{value:"MANUAL: Change of configuration codeblock for Sandwich Blueprint",id:"manual-change-of-configuration-codeblock-for-sandwich-blueprint",children:[],level:4}],level:3}],level:2}],p={toc:u};function m(e){var n=e.components,t=(0,a.Z)(e,o);return(0,i.kt)("wrapper",(0,r.Z)({},p,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"-migrations"},"\ud83d\udea6 Migrations"),(0,i.kt)("p",null,"Since ",(0,i.kt)("strong",{parentName:"p"},"AnkiBridge")," is still in its relative infancy, breaking changes may\nbe introduced (though always compliant with ",(0,i.kt)("a",{parentName:"p",href:"https://semver.org/"},"SemVer 2.0"),")."),(0,i.kt)("p",null,"This document will guide you through the changes you need to make to ",(0,i.kt)("em",{parentName:"p"},"migrate"),"\npast a ",(0,i.kt)("em",{parentName:"p"},"breaking change"),"."),(0,i.kt)("p",null,"Please follow the instructions for each migration carefully to ensure you end up\nwith a working setup."),(0,i.kt)("h2",{id:"future-migrations"},"Future migrations"),(0,i.kt)("p",null,"In version ",(0,i.kt)("inlineCode",{parentName:"p"},"0.4.1")," a migration tracker was introduced, which will allow ",(0,i.kt)("inlineCode",{parentName:"p"},"AnkiBridge")," to\nperform some migrations automatically in the future."),(0,i.kt)("p",null,"Whether a migration is automatic or manual is clearly sign-posted."),(0,i.kt)("div",{className:"admonition admonition-danger alert alert--danger"},(0,i.kt)("div",{parentName:"div",className:"admonition-heading"},(0,i.kt)("h5",{parentName:"div"},(0,i.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,i.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"},(0,i.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"}))),"Updating ",(0,i.kt)("em",{parentName:"h5"},"from")," ",(0,i.kt)("inlineCode",{parentName:"h5"},"0.4.0")," and before")),(0,i.kt)("div",{parentName:"div",className:"admonition-content"},(0,i.kt)("p",{parentName:"div"},"If you are upgrading from ",(0,i.kt)("inlineCode",{parentName:"p"},"0.4.0")," or a version prior to that the automatic\nmigration system will not work."),(0,i.kt)("p",{parentName:"div"},"As soon as you update to version ",(0,i.kt)("inlineCode",{parentName:"p"},"0.4.1")," or above, ",(0,i.kt)("em",{parentName:"p"},"future")," automatic migrations\nwill work."))),(0,i.kt)("h2",{id:"migrations"},"Migrations"),(0,i.kt)("h3",{id:"04x--05x"},(0,i.kt)("inlineCode",{parentName:"h3"},"0.4.x \u27f6 0.5.x")),(0,i.kt)("h4",{id:"manual-change-of-configuration-codeblock-for-sandwich-blueprint"},"MANUAL: Change of configuration codeblock for ",(0,i.kt)("a",{parentName:"h4",href:"/blueprints#-sandwich"},"Sandwich Blueprint")),(0,i.kt)("p",null,"The configuration codeblock was changed from:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-md"},"```anki\ndeck: \u2026\n\u2026\n```\n")),(0,i.kt)("p",null,"To:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-md"},"```anki-config\ndeck: \u2026\n\u2026\n```\n")),(0,i.kt)("p",null,"This was done to accommodate the new ",(0,i.kt)("a",{parentName:"p",href:"/blueprints#-basiccodeblock"},"BasicCodeBlock Blueprint"),"."),(0,i.kt)("p",null,"Changing all of the code-blocks is easily done manually at the time of migration\nby using a simple ",(0,i.kt)("strong",{parentName:"p"},"search-and-replace"),"."),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://code.visualstudio.com/"},"VSCode")," may be preferable to using Obsidian to do this."))}m.isMDXComponent=!0}}]);