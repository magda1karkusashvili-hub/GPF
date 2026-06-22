
document.addEventListener("DOMContentLoaded",()=>{


// MOBILE MENU

const toggle=document.querySelector(".menu-toggle");

const menu=document.querySelector(".menu");


if(toggle && menu){


toggle.onclick=()=>{

menu.classList.toggle("active");

};


}





// CLOSE MENU

document.querySelectorAll(".menu a").forEach(link=>{


link.onclick=()=>{

menu.classList.remove("active");

};


});





});





// GALLERY LIGHTBOX


function openLightbox(img){


let box=document.getElementById("lightbox");

let image=document.getElementById("lightbox-img");


if(box && image){

box.style.display="flex";

image.src=img.src;

}


}



function closeLightbox(){


let box=document.getElementById("lightbox");


if(box){

box.style.display="none";

}


}






// NEWS FILTER


function filterNews(category,event){


let cards=document.querySelectorAll(".news-card");


let buttons=document.querySelectorAll(".tab-btn");



buttons.forEach(btn=>{

btn.classList.remove("active");

});


if(event){

event.target.classList.add("active");

}



cards.forEach(card=>{


if(category==="all" || card.dataset.category===category){


card.style.display="block";


}else{


card.style.display="none";


}



});



}





// TYPING EFFECT


function typing(text,element){


let i=0;


let timer=setInterval(()=>{


if(i<text.length){


element.innerHTML+=text[i];

i++;


}else{


clearInterval(timer);


}


},40);


}




document.addEventListener("DOMContentLoaded",()=>{


let el=document.querySelector(".typing-text");


if(el){


typing(
"Moments captured during paragliding adventures across Georgia.",
el
);


}


});
