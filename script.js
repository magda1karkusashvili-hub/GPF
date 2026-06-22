/* =========================
RESET
========================= */

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:Arial,sans-serif;
}


/* =========================
BODY
========================= */

body{

    background-image:url("../images/para1.jpg");
    background-size:cover;
    background-position:center;
    background-attachment:fixed;

    color:white;
    min-height:100vh;
}


/* DARK OVERLAY */

body::before{

    content:"";
    position:fixed;

    inset:0;

    background:rgba(0,0,0,0.55);

    z-index:-1;
}



/* =========================
HEADER
========================= */


header{

    background:rgba(0,0,0,0.85);

    padding:10px 0;

    position:sticky;
    top:0;

    z-index:1000;
}



.container{

    max-width:1200px;

    margin:auto;

    padding:0 15px;

    display:flex;

    justify-content:space-between;

    align-items:center;

}



/* LOGO */


.logo{

    display:flex;

    align-items:center;

    gap:10px;

    text-decoration:none;

    color:white;

}


.logo img{

    width:42px;
    height:42px;

    border-radius:50%;

}



/* =========================
MENU
========================= */


.menu{

    display:flex;

    gap:18px;

}


.menu a{

    color:white;

    text-decoration:none;

    transition:.3s;

}


.menu a:hover{

    color:#00c2ff;

}



/* HAMBURGER */


.menu-toggle{

    display:none;

    font-size:30px;

    cursor:pointer;

}




/* =========================
HERO
========================= */


.hero{

    min-height:100vh;

    display:flex;

    align-items:center;

    justify-content:center;

    text-align:center;

}



.hero-overlay{

    max-width:800px;

    padding:25px;

}



.hero h1{

    font-size:42px;

    color:#00c2ff;

}


.hero p{

    margin:20px 0;

    font-size:18px;

    line-height:1.6;

}




/* BUTTON */


.btn{

    display:inline-block;

    margin-top:20px;

    padding:12px 25px;

    background:#00c2ff;

    color:black;

    border-radius:10px;

    text-decoration:none;

    font-weight:bold;

}


.btn:hover{

    background:white;

}




/* =========================
BOOKING
========================= */


.booking-section{

    max-width:760px;

    margin:auto;

    padding:70px 20px;

}


.booking-title h1{

    text-align:center;

    color:#00c2ff;

}


.subtext{

    text-align:center;

    color:#ccc;

    margin:20px;

}



.booking-form{


    display:flex;

    flex-direction:column;

    gap:15px;


    padding:30px;


    background:rgba(255,255,255,0.08);


    border-radius:16px;


    backdrop-filter:blur(10px);


}



.booking-form input,
.booking-form select{


    padding:12px;

    border-radius:10px;

    background:rgba(0,0,0,.4);

    color:white;

    border:1px solid #555;


}



.booking-form button{


    padding:14px;

    background:#00c2ff;

    border:none;

    border-radius:10px;

    font-weight:bold;

}



/* =========================
DOCUMENTS
========================= */


.document-section{

    max-width:900px;

    margin:auto;

    padding:60px 20px;

    text-align:center;

}



.docs-list{

    list-style:none;

    margin-top:30px;

}


.doc-item a{

    display:block;

    padding:18px;

    margin:15px 0;

    background:rgba(255,255,255,.07);

    color:white;

    text-decoration:none;

    border-radius:12px;


}



.doc-item a:hover{

    border:1px solid #00c2ff;

}



/* =========================
GALLERY
========================= */


.gallery-page{

    max-width:1200px;

    margin:auto;

    padding:50px 20px;

    text-align:center;

}



.gallery-page h1{

    color:#00c2ff;

}



.gallery-cards{

    display:grid;

    grid-template-columns:repeat(3,1fr);

    gap:15px;

}



.gallery-card img{

    width:100%;

    height:250px;

    object-fit:cover;

    border-radius:12px;

    cursor:pointer;

}




/* LIGHTBOX */


.lightbox{

    display:none;

    position:fixed;

    inset:0;

    background:black;

    justify-content:center;

    align-items:center;

}


.lightbox img{

    max-width:90%;

}




/* =========================
CONTACT
========================= */


.contact-box{

    max-width:520px;

    margin:80px auto;

    padding:35px;


    background:rgba(255,255,255,.08);


    border-radius:18px;


    text-align:center;

}



.contact-box h1{

    color:#00c2ff;

}



.contact-item{

    margin:20px;

}


.contact-item a{

    color:white;

    text-decoration:none;

}



/* =========================
MOBILE
========================= */


@media(max-width:768px){


.menu-toggle{

    display:block;

}


.menu{


    position:fixed;

    top:0;

    right:-100%;


    width:75%;

    height:100vh;


    background:rgba(0,0,0,.95);


    flex-direction:column;


    padding:80px 20px;


    transition:.3s;


}


.menu.active{

    right:0;

}



.hero h1{

    font-size:30px;

}



.gallery-cards{

    grid-template-columns:1fr;

}



}
