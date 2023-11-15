
const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');


function loadImage(e){
    const file = e.target.files[0];
    if (!isFileImage(file)){
        alertResult('Please Select Image', success=false);
        return;
    }

    //Get original dimensions
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = function () {
        widthInput.value = this.width;
        heightInput.value = this.height;
    }

    form.style.display = 'block';
    filename.innerText = file.name;
    outputPath.innerText = path.join(os.homedir(), 'imageResizer');
}

//send image to main
function sendImage(e){
    e.preventDefault();

    const width = widthInput.value;
    const height = heightInput.value;
    const imgPath = img.files[0].path;

    if (!img.files[0]){
        alertResult('Please upload an image', success=false);
        return;
    }

    if (width === '' || height ===''){
        alertResult('Please fill in a height and width', success=false);
    }

    //send to main using ipcRenderer
    ipcRenderer.send('image:resize',{
        imgPath,
        width,
        height
    }
    );
}

//Catch the image done event
ipcRenderer.on('image:done', ()=> {
    alertResult(`Image resize to ${widthInput.value} X ${heightInput.value}`, success=true);
})

//Check its image
function isFileImage(file){
    const acceptedTypes = ['image/gif', 'image/png', 'image/jpeg'];
    return file && acceptedTypes.includes(file['type']);
}

function alertResult(message, success){
    Toastify.toast( success ? {
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: 'green',
            color: "white",
            textAlign: 'center'
        }
    }:
    {
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: 'red',
            color: "white",
            textAlign: 'center'
        }
    }
    )
}




img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);