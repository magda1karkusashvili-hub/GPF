/* =========================
   HELPERS
========================= */

const qs = (s)=>document.querySelector(s);
const qsa = (s)=>document.querySelectorAll(s);



/* =========================
   MOBILE MENU
========================= */


function toggleMenu(){

const menu = document.getElementById("menu");


if(menu){

menu.classList.toggle("active");

}

}




document.addEventListener("DOMContentLoaded",()=>{


const menu = qs("#menu");
const toggle = qs(".menu-toggle");



if(menu && toggle){


toggle.addEventListener("click",(e)=>{

e.stopPropagation();

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



menu.querySelectorAll("a")
.forEach(link=>{


link.addEventListener("click",()=>{

menu.classList.remove("active");

});


});


}





/* =========================
   REVEAL ANIMATION
========================= */


function reveal(){


qsa(".reveal")
.forEach(el=>{


const pos =
el.getBoundingClientRect().top;



if(pos < window.innerHeight-100){

el.classList.add("active");

}


});


}



window.addEventListener(
"scroll",
reveal
);


reveal();





/* =========================
   HERO SLIDER
========================= */


let index=0;


const slides =
qsa(".hero .slide");



if(slides.length>1){


setInterval(()=>{


slides.forEach(s=>
s.classList.remove("active")
);



index =
(index+1)%slides.length;



slides[index]
.classList.add("active");



},3500);


}





/* =========================
   GALLERY
========================= */


qsa(".gallery-card")
.forEach(card=>{


const imgs =
card.querySelectorAll("img");



if(imgs.length<=1)
return;



let i=0;



imgs.forEach((img,x)=>{

img.style.display =
x===0 ? "block":"none";

});




setInterval(()=>{


imgs[i].style.display="none";


i=(i+1)%imgs.length;


imgs[i].style.display="block";


},3000);



});



});





/* =========================
   ABOUT BOX
========================= */


function toggleBox(el){

el.classList.toggle("active");

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

image.src=img.src;


}




function closeLightbox(){


const box =
qs("#lightbox");


if(box){

box.style.display="none";

}


}





/* =========================
   NEWS FILTER
========================= */


function filterNews(category,event){



qsa(".tab-btn")
.forEach(btn=>{

btn.classList.remove("active");

});



if(event){

event.target.classList.add("active");

}




qsa(".news-card")
.forEach(card=>{


if(
category==="all" ||
card.dataset.category===category
){

card.style.display="block";

}

else{

card.style.display="none";

}


});


}
