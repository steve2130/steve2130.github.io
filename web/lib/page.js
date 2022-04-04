// For Pages

const next_page_button = document.getElementById("next_page_button");
const previous_page_button = document.getElementById("previous_page_button");
const menu_button = document.getElementById("menu_button");
const image = document.getElementById("image");




window.addEventListener("load", () => {
    TestImageFormatSupport();
    RetrieveReadHistory();
}, false);

next_page_button.addEventListener("click", () => {
    ToNextImage();
    RecordReadHistory();
}, false);

previous_page_button.addEventListener("click", () => {
    ToPreviousImage();
    RecordReadHistory();
}, false);

menu_button.addEventListener("click", () => {

}, false);






async function ToNextImage() {
    let returnValues = GetCurrentPageNumber();
    let leadingSourcePath = returnValues[0];
    let currentPage = parseInt(returnValues[1]);

    let imagePreload = preloadImage(leadingSourcePath, currentPage);

        imagePreload
            .then(res => {
                console.log("");
            })
            .catch(res => {
                console.log("");
            });



    let nextPage = currentPage + 1;
    nextPage = AddLeadingZeros(nextPage);


    let fileExistance = CheckImageExistance(`${leadingSourcePath}/${nextPage}.jpg`);
    
        fileExistance
            .then(res => {
                image.src = `${leadingSourcePath}/${nextPage}.jpg`;
            })  

            .catch(res => {
                window.location.href = "../../../menu.html";
        });
}



async function ToPreviousImage() {
  let returnValues = GetCurrentPageNumber();
  let leadingSourcePath = returnValues[0];
  let currentPage = parseInt(returnValues[1]);


  let previousPage = currentPage - 1;
  previousPage = AddLeadingZeros(previousPage);


  let fileExistance = CheckImageExistance(`${leadingSourcePath}/${previousPage}.jpg`);

      fileExistance
          .then(res => {
              image.src = `${leadingSourcePath}/${previousPage}.jpg`;
      })  

          .catch(res => {
              window.location.href = "../../../menu.html";
      });
}







function AddLeadingZeros(PageNumber) {
    PageNumber = PageNumber.toString();
    PageNumber = PageNumber.padStart(3, '0');
    return PageNumber;
}


function GetCurrentPageNumber() {
    let currentSourcePath = image.getAttribute("src");
    let currentSourcePathSplited = currentSourcePath.split("/");

    return [currentSourcePathSplited[0], currentSourcePathSplited[1]];
}


async function CheckImageExistance(SourcePath) {
    return new Promise((resolve, reject) => {
            let img = new Image();
            img.src = SourcePath;

            img.onload = () => resolve(img);

            img.onerror = () => reject('failed');
    })
}


async function preloadImage(sourcePath, currentPage) {
  return new Promise ((resolve, reject) => {
      /*Preload 1 image for now, change it if you want*/

      let image = new Array;
      image[0] = new Image();
      image[1] = new Image();
      image[2] = new Image();

      let nextPage = currentPage;

      for (i = 0; i < image.length; i++) {
          nextPage = AddLeadingZeros(currentPage + 1);
          
          image[i].src = `${sourcePath}/${nextPage}.jpg`;

          currentPage = currentPage + 1;
      }


      image.onload = () => resolve();
      image.onerror = () => reject();
  }) 
}





// For adding shortcut on turing pages

window.addEventListener("keydown", (event) => {
    const key = event.key;

    switch (event.key) {

    case "ArrowRight":
        ToNextImage();
        break;

    case "ArrowLeft":
        ToPreviousImage();
        break;



    case "ArrowUp":
        ToPreviousImage();
        break;

    case "ArrowDown":
        ToNextImage();
        break;
    


    case "PageUp":
        ToPreviousImage();
        break;

    case "PageDown":
        ToNextImage();
        break;
    }
}, false);



                // Copied from here: https://www.sitepoint.com/html5-javascript-mouse-wheel/

                if (window.addEventListener) {    // Check whether window have an event listener. 

                    // IE9, Chrome, Safari, Opera
                    window.addEventListener("mousewheel", MouseWheelHandler, false);
                    // Firefox
                    window.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
                }

                // IE 6/7/8
                else window.attachEvent("onmousewheel", MouseWheelHandler);
            


            function MouseWheelHandler(e) {

                // cross-browser wheel delta
                var e = window.event || e;
                var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))); //???
                
                if (delta === -1) {
                    ToNextImage();
                }

                else {
                    ToPreviousImage();
                }

                return false;
            }



            // https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android
            // By Damian Pavlica

            let touchstartX = 0
            let touchendX = 0

            function handleGesture() {

                if (touchendX < touchstartX) {  // swipe from right to left
                    ToNextImage();
                }

                if (touchendX > touchstartX) {  // swipe from left to right
                    
                    ToPreviousImage();
                }
            }
            
            document.addEventListener('touchstart', e => {
                touchstartX = e.changedTouches[0].screenX
            })
            
            document.addEventListener('touchend', e => {
                 touchendX = e.changedTouches[0].screenX
                 handleGesture();
            })






// Record user reading history
// Not working (Recording part)

function RecordReadHistory() {
    setTimeout( () => {     // Update will be delayed if setTimeout() is not used.
        let returnValues = GetCurrentPageNumber();
        let currentPage = returnValues[1];
        localStorage.setItem('currentPage', currentPage);
    }, 100);

}


function RetrieveReadHistory() {
    let returnValues = GetCurrentPageNumber();
    let leadingSourcePath = returnValues[0];
    let currentReadingPage = localStorage.getItem('currentPage');

    if (currentReadingPage) {
        image.src = `${leadingSourcePath}/${currentReadingPage}`;
    }
    else {
        image.src = `${leadingSourcePath}/001.jpg`;
    }
}







function TestImageFormatSupport() {
    let webp = new Image();
    let avif = new Image();

    webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';

    
    webp.onload = () => {
        let webpSupport = true;
        return webpSupport;
    }

    webp.onerror = () => {
        let webpSupport = false;
        return webpSupport;
    }


    avif.onload = () => {
        let avifSupport = true;
        return avifSupport;
    }

    avif.onerror = () => {
        let avifSupport = false;
        return avifSupport;
    }
}


function ServeDifferentFormatOfImage() {

    if (avifSupport == true) {
        console.log("avif supported!");
    }

    else if (webpSupport == true) {
        console.log("webp supported!");
    }

    else {
        console.log("avif and webp not supported!");
    }
}