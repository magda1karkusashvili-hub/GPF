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
    const overlay = qs("#menuOverlay");


    if(menu && toggle){

        toggle.addEventListener("click",(e)=>{

            e.stopPropagation();

            menu.classList.toggle("active");

            if(overlay){
                overlay.classList.toggle("active");
            }

        });



        document.addEventListener("click",(e)=>{

            if(
                !menu.contains(e.target) &&
                !toggle.contains(e.target)
            ){

                menu.classList.remove("active");

                if(overlay){
                    overlay.classList.remove("active");
                }

            }

        });



        menu.querySelectorAll("a").forEach(link=>{

            link.addEventListener("click",()=>{

                menu.classList.remove("active");

                if(overlay){
                    overlay.classList.remove("active");
                }

            });

        });

    }




    /* =========================
       HERO SLIDER
    ========================= */


    let currentSlide = 0;

    const slides = qsa(".hero .slide");


    function showSlide(index){

        if(!slides.length) return;


        currentSlide =
        (index + slides.length) % slides.length;


        slides.forEach(slide=>{

            slide.classList.remove("active");

        });


        slides[currentSlide].classList.add("active");

    }



    if(slides.length > 1){

        setInterval(()=>{

            showSlide(currentSlide + 1);

        },3500);

    }





    /* =========================
       SCROLL REVEAL
    ========================= */


    function revealOnScroll(){

        qsa(".reveal").forEach(el=>{


            const position =
            el.getBoundingClientRect().top;


            if(position < window.innerHeight - 100){

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
       GALLERY SLIDER
    ========================= */


    qsa(".gallery-card").forEach(card=>{


        const imgs =
        card.querySelectorAll("img");


        if(imgs.length <= 1) return;


        let index = 0;


        imgs.forEach((img,i)=>{

            img.style.display =
            i===0 ? "block":"none";

        });



        setInterval(()=>{


            imgs[index].style.display="none";


            index =
            (index + 1) % imgs.length;


            imgs[index].style.display="block";


        },3000);



    });






    /* =========================
       ACTIVITY SLIDER
    ========================= */


    qsa(".activity-slider").forEach(slider=>{


        const slides =
        slider.querySelectorAll(".slide");


        if(slides.length <=1) return;


        let i=0;


        setInterval(()=>{


            slides[i].classList.remove("active");


            i =
            (i+1)%slides.length;


            slides[i].classList.add("active");


        },3000);



    });



});






/* =========================
   MODAL SYSTEM
========================= */


function openModal(type){


    const modal = qs("#modal");
    const title = qs("#modal-title");
    const text = qs("#modal-text");


    if(!modal || !title || !text)
        return;



    const data={


        mission:{
            title:"🎯 Mission",
            text:"To develop safe and professional paragliding experiences in Georgia."
        },


        safety:{
            title:"🛡 Safety",
            text:"We follow strict international aviation safety standards."
        },


        development:{
            title:"🎓 Development",
            text:"We train pilots and support aviation growth."
        },


        vision:{
            title:"🌍 Vision",
            text:"To make Georgia a world paragliding hub."
        }


    };



    if(!data[type]) return;



    title.innerText=data[type].title;

    text.innerText=data[type].text;


    modal.style.display="flex";

}



function closeModal(){

    const modal=qs("#modal");

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




window.addEventListener("click",(e)=>{


    const modal =
    qs("#passwordModal");


    if(modal && e.target===modal){

        modal.style.display="none";

    }


});







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
