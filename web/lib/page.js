// For Pages

const next_page_button = document.getElementById("next_page_button");
const previous_page_button = document.getElementById("previous_page_button");
const menu_button = document.getElementById("menu_button");
const image = document.getElementById("image");




window.addEventListener("load", () => {
    TestImageFormatSupport();
    RetrieveReadHistory();
    LayoutToggle();
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
    console.log("center button clicked");
}, false);






async function ToNextImage() {
    let returnValues = GetCurrentPageNumber();
    let leadingSourcePath = returnValues[0];
    let currentPage = parseInt(returnValues[1]);

console.time();
    let imagePreload = preloadImage(leadingSourcePath, currentPage, 3, true);

        imagePreload
            .then( () => {
                console.log("Image Preloaded!");
            })
            .catch( () => {
                console.log("Something is wrong with preloading image.");
            });

        

    let nextPage = currentPage + 1;
    nextPage = AddLeadingZeros(nextPage);


    let fileExistance = CheckImageExistance(`${leadingSourcePath}/${nextPage}.jpg`);
    
        fileExistance
            .then(res => {
                console.log("Next image existed!");
                image.src = `${leadingSourcePath}/${nextPage}.jpg`;
            })  

            .catch(res => {
                console.log("Next image did not existed!");
                window.location.href = "../../../menu.html";
        });

console.timeEnd();    
}



async function ToPreviousImage() {
    let returnValues = GetCurrentPageNumber();
    let leadingSourcePath = returnValues[0];
    let currentPage = parseInt(returnValues[1]);

    let imagePreload = preloadImage(leadingSourcePath, currentPage, 1, false);

    imagePreload
        .then( () => {
            console.log("Image Preloaded!");
        })
        .catch( () => {
            console.log("Something is wrong with preloading image.");
        });


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


async function preloadImage(sourcePath, currentPage, NumberOfImageToBeLoaded, operator) {
  return new Promise ((resolve, reject) => {
      /*Preload 3 image for now, change it if you want*/

    let image = new Array;
    for (j = 0; j < NumberOfImageToBeLoaded; j++) {
        image[j] = new Image();
    }
    
    
    let nextPage = currentPage;
    for (i = 0; i < NumberOfImageToBeLoaded; i++) {

        if (operator === true) {    // Next page (+)
            currentPage = currentPage + 1;
        }

        else if (operator === false) {    // Previous page (-)
            currentPage = currentPage - 1;
        }

        else {
            console.log("Operator ERROR!");
        }


        nextPage = AddLeadingZeros(currentPage);
        
        image[i].src = `${sourcePath}/${nextPage}.jpg`;
    }


    image.onload = () => resolve( fun => {
        console.log("Image Preloaded!");
      });

    image.onerror = () => reject( fun =>  {
        console.log("Something is wrong with preloading image.");
      });
    }) 
}





                // For adding shortcut on turing pages
                // Press keys to turn page
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



                // Scroll to turn page
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


                // Smartphone swipe to turn page
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
                });
                
                document.addEventListener('touchend', e => {
                    touchendX = e.changedTouches[0].screenX
                    handleGesture();
                });



                // Mouse drags to turn page
                //https://stackoverflow.com/questions/6042202/how-to-distinguish-mouse-click-and-drag
                // By andreyrd

                let startX = 0;
                let startY = 0;

                document.addEventListener("mousedown", e => {
                    startX = e.pageX;
                    startY = e.pageY;
                });

                document.addEventListener("mouseup", e => {
                    let diffX = Math.round(e.pageX - startX);   // calc how many pixel were dragged
                    let diffY = Math.round(e.pageY - startY);

                    if (diffX > 6) {            // How many pixel dragged to activate this function
                        ToPreviousImage();
                    }

                    else if (diffX < -6) {
                        ToNextImage();
                    }
                })




// Record user reading history

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

    webp.onerror = () => {
        let webpSupport = 44;
        ServeDifferentFormatOfImage(webpSupport);
    }

    avif.onerror = () => {
        let avifSupport = 77;
        ServeDifferentFormatOfImage(avifSupport);
    }

    setTimeout(fun => {
        webp = null;
        avif = null;
    }, 2000);   // to free the 1KB memory, be responsible
}


function ServeDifferentFormatOfImage(SupportedFormat) {

    if (SupportedFormat === 77) {
        console.log("AVIF NOT supported!");
    }

    else if (SupportedFormat === 44) {
        console.log("WEBP NOT supported!");
    }

    else {
        console.log("This browser does not support AVIF and WEBP!");
    }

}







const layout_example_wrapper = document.getElementById("layout_example_wrapper");

layout_example_wrapper.addEventListener("click", fun => {
    layout_example_wrapper.classList.add("LayoutExampleWrapper_Animation");
    localStorage.setItem('layoutDisplayed', true);

    setTimeout( () => {
        layout_example_wrapper.style.display = "none";
        layout_example_wrapper.classList.remove("LayoutExampleWrapper_Animation");
    }, 290);
})


// Display the layout

function LayoutToggle() {
    let layoutDisplayed = localStorage.getItem('layoutDisplayed');

    if (layoutDisplayed === false || !layoutDisplayed) {
        layout_example_wrapper.style.display = "block";
    }

    else {
        layout_example_wrapper.style.display = "none";
    }
}



// Check number of images in a volume
// - Backend code
//      > file IO -> easier to code, require DB?

// = Frontend code
//      > Algo -> I will make O(N^2) code, recursive code needed 