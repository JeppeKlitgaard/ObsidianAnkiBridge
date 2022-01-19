"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[994],{3905:function(e,n,t){t.d(n,{Zo:function(){return p},kt:function(){return k}});var r=t(7294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var s=r.createContext({}),d=function(e){var n=r.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},p=function(e){var n=d(e.components);return r.createElement(s.Provider,{value:n},e.children)},u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},c=r.forwardRef((function(e,n){var t=e.components,i=e.mdxType,a=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),c=d(t),k=i,g=c["".concat(s,".").concat(k)]||c[k]||u[k]||a;return t?r.createElement(g,o(o({ref:n},p),{},{components:t})):r.createElement(g,o({ref:n},p))}));function k(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var a=t.length,o=new Array(a);o[0]=c;var l={};for(var s in n)hasOwnProperty.call(n,s)&&(l[s]=n[s]);l.originalType=e,l.mdxType="string"==typeof e?e:i,o[1]=l;for(var d=2;d<a;d++)o[d]=t[d];return r.createElement.apply(null,o)}return r.createElement.apply(null,t)}c.displayName="MDXCreateElement"},7053:function(e,n,t){t.r(n),t.d(n,{frontMatter:function(){return l},contentTitle:function(){return s},metadata:function(){return d},toc:function(){return p},default:function(){return c}});var r=t(7462),i=t(3366),a=(t(7294),t(3905)),o=["components"],l={},s="\u2728 Features",d={unversionedId:"features",id:"features",title:"\u2728 Features",description:"\ud83d\uddbc Rendering",source:"@site/docs/20-features.md",sourceDirName:".",slug:"/features",permalink:"/ObsidianAnkiBridge/features",editUrl:"https://github.com/JeppeKlitgaard/ObsidianAnkiBridge/tree/master/docs/docs/20-features.md",tags:[],version:"current",sidebarPosition:20,frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"\ud83e\udd16 Auto-Sync",permalink:"/ObsidianAnkiBridge/advanced-usage/auto-sync"},next:{title:"\ud83d\udc83 Demonstration",permalink:"/ObsidianAnkiBridge/demonstration"}},p=[{value:"\ud83d\uddbc Rendering",id:"-rendering",children:[{value:"\ud83e\udd8b Live Preview Rendering",id:"-live-preview-rendering",children:[],level:3},{value:"\ud83e\uddee Math Rendering",id:"-math-rendering",children:[],level:3},{value:"\ud83c\udccf Deck Support",id:"-deck-support",children:[],level:3},{value:"\ud83c\udff7 Tag Support",id:"-tag-support",children:[],level:3},{value:"\ud83d\udcd8 Blueprints",id:"-blueprints",children:[],level:3},{value:"\ud83d\udcfa Media Rendering",id:"-media-rendering",children:[],level:3},{value:"\u2754 Cloze Deletion",id:"-cloze-deletion",children:[],level:3},{value:"Link Rendering",id:"link-rendering",children:[],level:3},{value:"Link Back to Source",id:"link-back-to-source",children:[],level:3}],level:2},{value:"\u267b Safe sync",id:"-safe-sync",children:[{value:"\ud83d\udeae Delete from Obsidian",id:"-delete-from-obsidian",children:[],level:3},{value:"\ud83e\udd16 Automagic",id:"-automagic",children:[],level:3}],level:2}],u={toc:p};function c(e){var n=e.components,t=(0,i.Z)(e,o);return(0,a.kt)("wrapper",(0,r.Z)({},u,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"-features"},"\u2728 Features"),(0,a.kt)("h2",{id:"-rendering"},"\ud83d\uddbc Rendering"),(0,a.kt)("h3",{id:"-live-preview-rendering"},"\ud83e\udd8b Live Preview Rendering"),(0,a.kt)("p",null,"The ",(0,a.kt)("a",{parentName:"p",href:"/blueprints#-basiccodeblock"},"BasicCodeBlock Blueprint")," offers excellent\nrendering in ",(0,a.kt)("em",{parentName:"p"},"Live Preview"),", making your notes seamlessly integrate into\nthe rest of your beautiful Obsidian notes."),(0,a.kt)("p",null,"For an example, have a look at the ",(0,a.kt)("a",{parentName:"p",href:"/demonstration"},"\ud83d\udc83 Demonstration")," page."),(0,a.kt)("h3",{id:"-math-rendering"},"\ud83e\uddee Math Rendering"),(0,a.kt)("p",null,"Using the Math ",(0,a.kt)("a",{parentName:"p",href:"/processors"},"postprocessor")," your LaTeX in Obsidian will\ncorrectly be rendered in Anki."),(0,a.kt)("h3",{id:"-deck-support"},"\ud83c\udccf Deck Support"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"AnkiBridge")," intelligently finds the right deck for your note."),(0,a.kt)("p",null,"The deck to upload to is resolved in the following order:"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"The value specified by the deck key of your ",(0,a.kt)("a",{parentName:"li",href:"/notes#configuration"},"note configuration")),(0,a.kt)("li",{parentName:"ol"},"The deepest match of your ",(0,a.kt)("a",{parentName:"li",href:"/settings#-default-deck-mapping"},"default deck mapping")),(0,a.kt)("li",{parentName:"ol"},"The default value specified in ",(0,a.kt)("a",{parentName:"li",href:"/settings#-default-deck-mapping"},"settings"))),(0,a.kt)("h3",{id:"-tag-support"},"\ud83c\udff7 Tag Support"),(0,a.kt)("p",null,"You can specify Anki tags for your notes using the ",(0,a.kt)("a",{parentName:"p",href:"/notes#configuration"},"note configuration")),(0,a.kt)("p",null,"Optionally a global tag for all your notes can be set using the ",(0,a.kt)("a",{parentName:"p",href:"/settings#-general-settings"},"settings")),(0,a.kt)("h3",{id:"-blueprints"},"\ud83d\udcd8 Blueprints"),(0,a.kt)("p",null,"Your notes are found using ",(0,a.kt)("a",{parentName:"p",href:"/blueprints"},"Blueprints")," using a ",(0,a.kt)("inlineCode",{parentName:"p"},"PEG")," parser."),(0,a.kt)("p",null,"This has several advantages:"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"Easily extensible"),(0,a.kt)("li",{parentName:"ol"},"Performant (as opposed to regex-based solutions)"),(0,a.kt)("li",{parentName:"ol"},"Avoids collisions \u2013 a block of text in your Obsidian documents can only be used by a single blueprint."),(0,a.kt)("li",{parentName:"ol"},"Easier to debug")),(0,a.kt)("h3",{id:"-media-rendering"},"\ud83d\udcfa Media Rendering"),(0,a.kt)("p",null,"Using the Media ",(0,a.kt)("a",{parentName:"p",href:"/processors"},"postprocessor")," any embedded images, videos, and audios from\nyour Obsidian vault will be synchronised to Anki seamlessly!"),(0,a.kt)("h3",{id:"-cloze-deletion"},"\u2754 Cloze Deletion"),(0,a.kt)("p",null,"Cloze deletion is a breeze when using the Cloze ",(0,a.kt)("a",{parentName:"p",href:"/processors"},"postprocessor"),"."),(0,a.kt)("p",null,"It supports turning both deletion and marks into clozes:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-md"},"~~Paris~~ is the capitol of ~~France~~\n")),(0,a.kt)("p",null,"Or "),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-md"},"==London== is the capitol of ==England==\n")),(0,a.kt)("h3",{id:"link-rendering"},"Link Rendering"),(0,a.kt)("p",null,"Links to other files in your Obsidian vault are automatically turned into URI links\nusing the Links ",(0,a.kt)("a",{parentName:"p",href:"/processors"},"postprocessor"),"\nthat will take you straight to the right place in your vault from within Anki."),(0,a.kt)("h3",{id:"link-back-to-source"},"Link Back to Source"),(0,a.kt)("p",null,"When using the LinkToSource ",(0,a.kt)("a",{parentName:"p",href:"/processors"},"postprocessor")," ",(0,a.kt)("strong",{parentName:"p"},"AnkiBridge")," will add a link\nto the front of your cards taking you back to the note in Obsidian."),(0,a.kt)("h2",{id:"-safe-sync"},"\u267b Safe sync"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"AnkiBridge")," will always use the Obsidian note as a ground-truth, so you can\nbe sure that the Anki notes reflect what is in your vault."),(0,a.kt)("div",{className:"admonition admonition-note alert alert--secondary"},(0,a.kt)("div",{parentName:"div",className:"admonition-heading"},(0,a.kt)("h5",{parentName:"div"},(0,a.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,a.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,a.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"Always update AnkiBridge cards in Obsidian")),(0,a.kt)("div",{parentName:"div",className:"admonition-content"},(0,a.kt)("p",{parentName:"div"},"Since ",(0,a.kt)("strong",{parentName:"p"},"AnkiBridge")," uses Obsidian as ground-truth, it will overwrite any\nchanges made to Obsidian-controlled notes in Anki."))),(0,a.kt)("h3",{id:"-delete-from-obsidian"},"\ud83d\udeae Delete from Obsidian"),(0,a.kt)("p",null,"You can delete a note from Anki using ",(0,a.kt)("strong",{parentName:"p"},"AnkiBridge")," by setting the ",(0,a.kt)("inlineCode",{parentName:"p"},"delete"),"\nkey of the ",(0,a.kt)("a",{parentName:"p",href:"/notes#configuration"},"note configuration")," to ",(0,a.kt)("inlineCode",{parentName:"p"},"true")," and performing a sync."),(0,a.kt)("h3",{id:"-automagic"},"\ud83e\udd16 Automagic"),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"AnkiBridge")," automatically moves your notes to the appropriate deck in Anki when\nupdating the Obsidian note."),(0,a.kt)("p",null,"Similarly it will update your Anki note tags and field content whenever you sync!"))}c.isMDXComponent=!0}}]);