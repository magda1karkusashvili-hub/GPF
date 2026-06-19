/* =========================
   HELPERS
========================= */

const qs = (s) => document.querySelector(s);
const qsa = (s) => document.querySelectorAll(s);



/* =========================
   DOM READY
========================= */


document.addEventListener("DOMContentLoaded",()=>{



/* =========================
   MOBILE MENU
========================= */


const menu = document.getElementById("menu");

const toggle = document.querySelector(".menu-toggle");



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




menu.querySelectorAll("a").forEach(link=>{


link.addEventListener("click",()=>{

menu.classList.remove("active");


});


});


}




/* =========================
   SCROLL REVEAL
========================= */


function reveal(){


qsa(".reveal").forEach(el=>{


let position =
el.getBoundingClientRect().top;



if(position < window.innerHeight-100){


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


let slideIndex=0;


const slides =
qsa(".hero .slide");



function showSlide(i){


if(!slides.length)
return;



slides.forEach(s=>{

s.classList.remove("active");

});



slideIndex =
(i+slides.length)%slides.length;



slides[slideIndex]
.classList.add("active");


}




if(slides.length>1){


setInterval(()=>{


showSlide(slideIndex+1);


},3500);


}





/* =========================
   GALLERY AUTO SLIDER
========================= */


qsa(".gallery-card").forEach(card=>{


let images =
card.querySelectorAll("img");



if(images.length<=1)
return;



let index=0;



images.forEach((img,i)=>{


img.style.display =
i===0 ? "block":"none";


});




setInterval(()=>{


images[index]
.style.display="none";



index =
(index+1)%images.length;



images[index]
.style.display="block";



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


if(box)

box.style.display="none";


}





/* =========================
   MODAL
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

text:
"Develop safe and professional paragliding experiences in Georgia."

},



safety:{

title:"🛡 Safety",

text:
"We follow international aviation safety principles."

},



development:{

title:"🎓 Development",

text:
"We train pilots and support aviation growth."

}


};




if(!data[type])
return;



title.innerText =
data[type].title;



text.innerText =
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
   NEWS FILTER
========================= */


function filterNews(category,event){



document
.querySelectorAll(".tab-btn")
.forEach(btn=>{


btn.classList.remove("active");


});



event.target.classList.add("active");




document
.querySelectorAll(".news-card")
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
