// For Pages

const next_page_button = document.getElementById("next_page_button");
const previous_page_button = document.getElementById("previous_page_button");
const image = document.getElementById("image");



next_page_button.addEventListener("click", fun => ToNextImage(), false);
previous_page_button.addEventListener("click", fun => ToPreviousImage(), false);





async function ToNextImage() {
    let returnValues = GetCurrentPageNumber();
    let leadingSourcePath = returnValues[0];
    let currentPage = parseInt(returnValues[1]);

    let imagePreload = preloadImage(leadingSourcePath, currentPage);

        imagePreload
            .then(res => {
                console.log(":)");
            })
            .catch(res => {
                console.log(res);
            });



    let nextPage = currentPage + 1;
    nextPage = AddLeadingZeros(nextPage);


    let fileExistance = CheckImageExistance(`${leadingSourcePath}/${nextPage}.jpg`);
    
        fileExistance
            .then(res => {
                image.src = `${leadingSourcePath}/${nextPage}.jpg`;
            })  

            .catch(res => {
                window.location.href = "../../menu.html";
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
              window.location.href = "../../menu.html";
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



// Record user reading history
// Not working (Recording part)

window.addEventListener("beforeunload", RecordReadHistory(), false);
window.addEventListener("unload", RecordReadHistory(), false);

function RecordReadHistory() {

      let returnValues = GetCurrentPageNumber();
      let currentPage = returnValues[1];
      localStorage.setItem('currentPage', currentPage);   

}




window.addEventListener("load", RetrieveReadHistory(), false);

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