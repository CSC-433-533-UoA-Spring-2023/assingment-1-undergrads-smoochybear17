/*
  Basic File I/O for displaying
  Skeleton Author: Joshua A. Levine
  Modified by: Amir Mohammad Esmaieeli Sikaroudi
  Email: amesmaieeli@email.arizona.edu
*/

// Access DOM elements
var input = document.getElementById("load_image");
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var width = 0, height = 0;
var ppm_img_data;

var angle = 0;
var scale = 1;  
var scaleDirection = 1; 


var upload = function () {
    if (input.files.length > 0) {
        var file = input.files[0];
        var fReader = new FileReader();
        fReader.readAsBinaryString(file);

        fReader.onload = function(e) {
            var file_data = fReader.result;
            parsePPM(file_data);
            requestAnimationFrame(animate); // Start animation loop
        }
    }
};


function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var rotationMatrix = GetRotationMatrix(angle);
    var scaleMatrix = GetScalingMatrix(scale, scale);
    var transformationMatrix = MultiplyMatrixMatrix(rotationMatrix, scaleMatrix);

    var newImageData = ctx.createImageData(width, height);
    
    for (var i = 0; i < ppm_img_data.data.length; i += 4) {
        var pixel = [
            Math.floor(i / 4) % width - width / 2, 
            Math.floor(i / 4) / width - height / 2, 
            1
        ];

        var transformedPixel = MultiplyMatrixVector(transformationMatrix, pixel);

        transformedPixel[0] = Math.floor(transformedPixel[0] + width / 2);
        transformedPixel[1] = Math.floor(transformedPixel[1] + height / 2);

        setPixelColor(newImageData, transformedPixel, i);
    }

    ctx.putImageData(newImageData, canvas.width / 2 - width / 2, canvas.height / 2 - height / 2);

    angle += 2;  
    if (angle >= 360) angle = 0;

    if (scale >= 1.5) scaleDirection = -1;
    if (scale <= 0.5) scaleDirection = 1;
    scale += scaleDirection * 0.02;

    requestAnimationFrame(animate);
}


function setPixelColor(newImageData, samplePixel, i){
    var offset = ((samplePixel[1] - 1) * width + samplePixel[0] - 1) * 4;
    newImageData.data[i] = ppm_img_data.data[offset];
    newImageData.data[i + 1] = ppm_img_data.data[offset + 1];
    newImageData.data[i + 2] = ppm_img_data.data[offset + 2];
    newImageData.data[i + 3] = 255;
}


function parsePPM(file_data){
    var lines = file_data.split(/#[^\n]*\s*|\s+/);
    var counter = 0, format = "", max_v = 0;
    
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].length == 0) continue;
        if (counter == 0) format = lines[i];
        else if (counter == 1) width = lines[i];
        else if (counter == 2) height = lines[i];
        else if (counter == 3) max_v = Number(lines[i]);
        else if (counter > 3) break;
        counter++;
    }

    var bytes = new Uint8Array(3 * width * height);
    var raw_data = file_data.substring(file_data.length - width * height * 3);

    for (var i = 0; i < width * height * 3; i++) {
        bytes[i] = raw_data.charCodeAt(i);
    }

    ctx.canvas.width = 600;
    ctx.canvas.height = 600;

    var image_data = ctx.createImageData(width, height);
    for (var i = 0; i < image_data.data.length; i += 4) {
        let pixel_pos = parseInt(i / 4);
        image_data.data[i] = bytes[pixel_pos * 3];
        image_data.data[i + 1] = bytes[pixel_pos * 3 + 1];
        image_data.data[i + 2] = bytes[pixel_pos * 3 + 2];
        image_data.data[i + 3] = 255;
    }
    
    ctx.putImageData(image_data, canvas.width / 2 - width / 2, canvas.height / 2 - height / 2);
    ppm_img_data = image_data;
}

input.addEventListener("change", upload);

