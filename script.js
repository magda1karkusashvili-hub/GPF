/* =========================
   SAFE HELPERS
========================= */

const qs = (s) => document.querySelector(s);
const qsa = (s) => document.querySelectorAll(s);



/* =========================
   DOM READY
========================= */


document.addEventListener("DOMContentLoaded", () => {



/* =========================
   MOBILE MENU
========================= */


const menu = qs("#menu");
const toggle = qs(".menu-toggle");


if(menu && toggle){


toggle.addEventListener("click",()=>{


menu.classList.toggle("active");


});



document.addEventListener("click",(e)=>{


if(
!menu.contains(e.target) &&
!toggle.contains(e.target)
){


menu.classList.remove("active");


}


});


}




/* =========================
   HERO SLIDER
========================= */


let currentSlide = 0;


const slides =
qsa(".hero .slide");



function showSlide(index){


if(!slides.length) return;



currentSlide =
(index + slides.length)
% slides.length;



slides.forEach(slide=>{


slide.classList.remove("active");


});



slides[currentSlide]
.classList.add("active");


}




if(slides.length > 1){


setInterval(()=>{


showSlide(currentSlide+1);


},3500);


}






/* =========================
   SCROLL REVEAL
========================= */


function revealOnScroll(){


qsa(".reveal")
.forEach(el=>{


let position =
el.getBoundingClientRect().top;



if(position <
window.innerHeight - 100){


el.classList.add("active");


}


});


}



window.addEventListener(
"scroll",
revealOnScroll
);



revealOnScroll();







/* =========================
   GALLERY LIGHTBOX
========================= */


qsa(".gallery-card img")
.forEach(img=>{


img.addEventListener(
"click",
()=>{


openLightbox(img);


});


});







/* =========================
   GALLERY AUTO SLIDER
========================= */


qsa(".gallery-card")
.forEach(card=>{


const imgs =
card.querySelectorAll("img");



if(imgs.length <=1)
return;



let index=0;



imgs.forEach((img,i)=>{


img.style.display =
i===0 ? "block":"none";


});




setInterval(()=>{


imgs[index]
.style.display="none";



index =
(index+1)%imgs.length;



imgs[index]
.style.display="block";



},3000);



});





});








/* =========================
   MODAL SYSTEM
========================= */


function openModal(type){



const modal =
qs("#modal");


const title =
qs("#modal-title");


const text =
qs("#modal-text");



if(!modal)
return;




const data={



mission:{

title:"🎯 Mission",

text:"To develop safe and professional paragliding experiences in Georgia."

},




safety:{

title:"🛡 Safety",

text:"We follow international aviation safety standards and procedures."

},





development:{

title:"🎓 Development",

text:"We support pilot education, training and aviation development."

},




vision:{

title:"🌍 Vision",

text:"To make Georgia one of the leading paragliding destinations."

}



};





if(!data[type])
return;




title.innerHTML =
data[type].title;



text.innerHTML =
data[type].text;




modal.style.display="flex";


}






function closeModal(){



const modal =
qs("#modal");



if(modal)

modal.style.display="none";


}








/* =========================
   PASSWORD MODAL
========================= */


function openPasswordModal(){


const modal =
qs("#passwordModal");


if(modal)

modal.style.display="flex";


}




function closePasswordModal(){


const modal =
qs("#passwordModal");


if(modal)

modal.style.display="none";


}








/* =========================
   LIGHTBOX
========================= */


function openLightbox(img){



const box =
qs("#lightbox");


const image =
qs("#lightbox-img");



if(!box || !image)
return;



box.style.display="flex";

image.src =
img.src;



}





function closeLightbox(){


const box =
qs("#lightbox");



if(box)

box.style.display="none";


}
