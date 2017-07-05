/////////Оголошення змінних, зо часто юзаються
var btnBrowse = document.getElementById('btn-browse');
var btnRemote = document.getElementById('btn-remote');
var path = document.getElementById('path');
var local = document.getElementById('local');
var remote = document.getElementById('remote');
var lableBtn = document.getElementById('lable-btn');
var lableBtnRemote = document.getElementById('lable-btn-remote');
var canvasHead = document.getElementById('canvas-header');
var canvas = document.getElementById('main-canvas');
var ctx = canvas.getContext('2d');
var canvasDiv = document.getElementById('div-canvas');
var popupCanvas = document.getElementById('popup-canvas');
var ctxPop = popupCanvas.getContext('2d');
var popupImgSize = {};
///////////////////////////////
///////Функція, що міняє кнопки у формі Image source,при зміні радіобатонів
var changeBtn = function(val){
	return function(){
		if(val == 'remote'){
			lableBtn.style.display = 'none';
			lableBtnRemote.style.display = 'inline-block';
            path.value = '';
            path.removeAttribute('disabled');//видаляємо дісейбл інпуту для вставки урла на картинку        
		}else{
			lableBtnRemote.style.display = 'none';
			lableBtn.style.display = 'inline-block';
            path.setAttribute('disabled','disabled');
		}
	}
}
////////////////////////////////////////////////////
////Функція для зміни розмірів канвасу при додаванні великих картинок
///Для картинок, які до 4 разів більші за канвас, канвас прийме їх розміри
var resize = function (width,height){
	var diffW=0, diffH=0;
    diffW = Math.floor(width/canvas.width);
    diffH = Math.floor(height/canvas.width);
    if(diffW || diffH){
    	canvasDiv.style.width = canvas.width = width;
    	canvasDiv.style.height = canvas.height = height;
        canvasHead.style.margin = canvasDiv.style.margin = '0 15%';
        canvasHead.style.width = width+'px'; 
    }
 }
////////////////////////////////////
////Функція, що формуватиме об"єкт картинки (1), мінятиме розміри канвасу (якщо великі картинки)(2),
//закину картинку в канвас(3), маніпулуюватиме хедером над канвасом(4), виклbкатиме функцію для crop-mode(5)
var makeImgObj = function(src){
	var img = new Image();//1
        img.onload = function(){
        	resize(img.width, img.height);//2
           	ctx.drawImage(img,0,0,canvas.width,canvas.height);//3
            document.querySelector('#canvas-status>div').style['left'] = 0;//4
            document.querySelector('#canvas-status>div').style['right'] = '20px';//4
            document.querySelector('#canvas-status').style['background'] = 'lightblue';//4
            initDraw(canvasDiv);//5
        }
    img.src = src;
}
////////////////////////////////////////////////
////Функція для формування правильного img.src для передачі в канвас
// і для виклику makeImgObj функції + в інпут записує назву файла.
var loadImage = function(fileName,e){
	path.value = fileName;
		var reader = new FileReader();
    	reader.onload = function(event){
        	makeImgObj(event.target.result)
    	}
    	reader.readAsDataURL(e.target.files[0]); 
}
///////////////////////////////////////
/////Функція для виклику функції makeImgObj з передачею їй пастнутого урла
///і паст-івенту
var pastImage = function(url,e){	
	makeImgObj(url);
}
////Оброботчик кліку по копці Browse
function handlerbtnBrowse(event){
	this.type = 'file'; ///міняє тип інпуту з кнопки на файл, для завантаження картинок
	this.addEventListener('change',function(e){/// вибір картинки і перевірка її розширення
		var fileName = this.files.length?this.files[0].name:'',
			reg = /\.(?:jp(?:e?g|e|2)|gif|png|tiff?|bmp|ico)$/i,
			valid = fileName.search(reg);
		if(~valid){//якщо ок, то малює в канвасі
			loadImage(fileName,e);		
    	}
	});
}
/////////////////////////////
///Функція-обработчик при нажиманні на кнопку Past
function handlerbtnRemote(e){
 	pastImage(path.value,e);
}
//////////////////////////////
btnBrowse.addEventListener('click',handlerbtnBrowse);///створюємо подію клік для кнопки Browse і вішаємо на неї відповідний обработчик
btnRemote.addEventListener('click',handlerbtnRemote);///створюємо подію клік для кнопки Past і вішаємо на неї відповідний обработчик
local.addEventListener('change',changeBtn('browse'));//////Зміна radio на local//////////////////
remote.addEventListener('change',changeBtn('remote'));//////Зміна radio на remote//////////////////
////////створюємо подію для пасту урла в інпут поле
path.addEventListener('paste',function(e){
    var clipboardData, pastedData;
    e.stopPropagation();/// для спрацювання події тільки на текучому таргеті 
    e.preventDefault();// відміняє подію паст для наших подальших маніпуляцій
    clipboardData = e.clipboardData || window.clipboardData;//ініціалізація об"єкту буфера обміну 
    pastedData = clipboardData.getData('Text');//дістаємо інфу, що є зараз в буфері (це має бути наш урл на картинку)
    var valid = false;
    valid = /(?:http|https):\/\/((?:[\w-]+)(?:\.[\w-]+)+)(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gm.test(pastedData); //проходимо валідацію на урл, чи то дійсно урл
    if(valid){//якщо ок
        this.value = pastedData;//вставляємо в полу інпуту урл 
        this.setAttribute('disabled','disabled');//дісейблимо інпут після вставки урла
    }
})
////////////////////////////////////////
///робми подію кейпрес для інпуту, щоб юзер нічого не міг туди написати, тільки вставити
path.addEventListener('keypress',function(e){
        this.setAttribute('disabled','disabled');///після кейпресу дісейблимо інпут
        setTimeout(function(){
            path.removeAttribute('disabled'); ///через 100мс роздісейблюємо (можна було алертом меседж вивести чи шо, але то таке)
        },100);
})
///Функція, що задаватиме розміри канвасу у діалоговому вікні 
//і вставлятиме  туди вирізане зображення
function draw(sx,sy,sw,sh,dx,dy) {
    sx = sx<dx ? sx : dx;// визначаємо, з яких координат почне вирізатися картинка
    sy = sy<dy ? sy : dy;// ця перевірка необхідна, якщо ми нажали мишкою і повели лівіше і/або вище нажатої точки, 
    //то координати для початку вирізання в канвасі стануть не ті, що ми зажали, а ті, де відпустили клік 
  popupCanvas.width = sw;//задаємо розміри кавасу, що дорівнюватимуть розмірам вирізаної картинки
  popupCanvas.height = sh;
  document.getElementById('div-popup-canvas').style.left =  'calc(50% - '+sw/2+'px)';//відцентрувати
  console.log(sx, sy, sw, sh, 0, 0, sw, sh);
  ctxPop.drawImage(canvas,sx, sy, sw, sh, 0, 0, sw, sh);//вставить вирізану картинку в попап канвас 
}
///////////////////////////////////////////
//////Функція для визначення координат позиції елемента канвасу (в даному випадку діва, де знаходиться канвас) в ДОМі
function getOffsetSum(elem) {
    var top=0, left=0
    while(elem) {
        top = top + parseFloat(elem.offsetTop)
        left = left + parseFloat(elem.offsetLeft)
        elem = elem.offsetParent        
    }    
    return {top: Math.round(top), left: Math.round(left)}//координати
}
////////////////////////////////////////
///////////Функція, що як аргумент, прийматиме Дом-елемент і на ньому малюватиме штрихпунктирний прямокутник, визначатиме його координати і передавати координати "вирізаного зображення" у функцію draw
function initDraw(el) {
    function setMousePosition(e) {/// визначає координати миші і передає в об"єкт mouse 
       var ev = e || window.event; //Moz || IE
        if (ev.pageX) { //Moz
            mouse.x = ev.pageX - getOffsetSum(el).left; // визначає координати відносно вікна, для того щоб визначало відносно елемента,->
            mouse.y = ev.pageY - getOffsetSum(el).top; // -> віднімаємо від координат відносно вікна координати елемента, на якому хочемо водити мишкою 
        } else if (ev.clientX) { //IE
            mouse.x = ev.clientX - getOffsetSum(el).left;;
            mouse.y = ev.clientY - getOffsetSum(el).top;;
        }  	

    };

    var mouse = {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
    };
    var element = null;

    el.onmousemove = function (e) {// при русі мишки 
        setMousePosition(e); //визначаємо координати курсора
        if (element !== null) {
            element.style.width = Math.abs(mouse.x - mouse.startX) + 'px'; //визначаємо розміри прямокутника, шляхом віднімання текучої координати mouse.x від почакової (перший раз клікнутої) координати mouse.startX
            element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
            element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';//визначаємо положення прямокутника на елементі
            element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
        }
    }

    el.onmousedown = function (e) { //при кліку
            console.log("begun.");
            mouse.startX = mouse.x;//текучі координати записуємо в початкові (startX)
            mouse.startY = mouse.y;
            element = document.createElement('div');//створюємо дів'ку прямокутника, робимо її дочірним для дівки канвасу, задаємо положення 
            element.className = 'rectangle'
            element.style.left = mouse.x + 'px';
            element.style.top = mouse.y + 'px';
            el.appendChild(element)
            el.style.cursor = "crosshair";
    }
    el.onmouseup = function (e) {//при відпусканні кліку
    		el.removeChild(element);// видаляємо прямокутник з канвасу
            element = null;
            console.log(mouse);
            el.style.cursor = "default";
            console.log("finsihed.");
            var sw = popupImgSize.w = Math.abs(mouse.x - mouse.startX);//визначаємо ширину прямокутника
            var sh = popupImgSize.h = Math.abs(mouse.y - mouse.startY);//визначаємо висоту прямокутника
            console.log(sw,sh);
            draw(mouse.startX,mouse.startY,sw,sh,mouse.x,mouse.y); // передаємо розміри і координати для функції, що виведе вирізаний елемент картинки в канвас діалогового вікна
            
            document.getElementById('mask-overlay').style.display = 'block'; //виводимо діалювікно (по замовчуванню display:none)
        }
}
///////////////////////////////////////////////////////////////////
document.getElementsByClassName('modal-btn')[0].addEventListener('click',function(e){ // оброблямо кліки подій для кожної кнопки діалогового вікна 
    switch (e.target.parentNode.getAttribute('id')){ //визначаємо id батьківського елемента, в яких лежать кнопки і описуємо
        case 'btn-cancel'://закриття мод. вікна
            document.getElementById('mask-overlay').style.display = 'none';//ховаємо діалогове вікно
            break;
        case 'btn-replace'://перезапис картинки з попапу в головний канвас
            ctx.clearRect(0, 0, canvas.width, canvas.height);//чистимо головний канвас
            canvasDiv.style.width = canvasHead.style.width = popupImgSize.w+'px';//задаємо нові розміри відносно вирізаної картинки (бо не зробив норм маштабування)
            canvasHead.style.margin = canvasDiv.style.margin = '0 auto';
            canvas.width = popupImgSize.w; 
            canvas.height = popupImgSize.h;
            canvasDiv.style.height = popupImgSize.h+'px';
            ctx.drawImage(popupCanvas,0, 0, popupImgSize.w, popupImgSize.h, 0, 0, popupImgSize.w, popupImgSize.h);//малюємо
            document.getElementById('mask-overlay').style.display = 'none';//ховаємо діалогове вікно
            break;
        case 'downloadLnk'://скачування картинки
            var dt = popupCanvas.toDataURL('image/jpeg');//робимо урл на картинку
            e.target.parentNode.setAttribute('href',dt);//підставляємо урл в тег <a>
            document.getElementById('mask-overlay').style.display = 'none';//ховаємо діалогове вікно
            break;
    }
})