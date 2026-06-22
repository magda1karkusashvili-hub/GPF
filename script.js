/* =========================
 MOBILE MENU
========================= */


document.addEventListener(
"DOMContentLoaded",
()=>{


const toggle =
document.querySelector(".menu-toggle");


const menu =
document.querySelector(".menu");



if(toggle && menu){


toggle.addEventListener(
"click",
()=>{


menu.classList.toggle("active");


});



}




});






/* =========================
 GALLERY LIGHTBOX
========================= */


function openLightbox(img){


const box =
document.getElementById("lightbox");


const image =
document.getElementById("lightbox-img");



if(box && image){


box.style.display="flex";


image.src=img.src;


}



}




function closeLightbox(){


const box =
document.getElementById("lightbox");


if(box){


box.style.display="none";


}


}








/* =========================
 ABOUT MODAL
========================= */


function openModal(type){



const modal =
document.getElementById("modal");


const title =
document.getElementById("modal-title");


const text =
document.getElementById("modal-text");




let data={



mission:{


title:"🎯 Mission",


text:
"Develop paragliding in Georgia as a safe and internationally recognized aviation sport."

},



safety:{


title:"🛡 Safety",


text:
"Safety is the main principle of every flight operation."

},



development:{


title:"🎓 Development",


text:
"Supporting pilot education and aviation development."

}



};






if(data[type]){


title.innerHTML=data[type].title;


text.innerHTML=data[type].text;


modal.style.display="flex";


}




}





function closeModal(){


let modal =
document.getElementById("modal");


if(modal){


modal.style.display="none";


}



}







/* =========================
 NEWS FILTER
========================= */



function filterNews(category){



let cards =
document.querySelectorAll(".news-card");




cards.forEach(card=>{


if(
category==="all"
||
card.dataset.category===category
){


card.style.display="block";


}

else{


card.style.display="none";


}



});



}
