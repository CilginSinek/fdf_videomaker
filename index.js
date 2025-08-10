const fs = require("fs");
const path = require("path");
const jimp = require("jimp");

const fps = 30;
const outputFile = "output.fdfs";
const inputFile = "essek.mp4";
const tempDir = "temp_f";
const ffmpegPath = "./ffmpeg/ffmpeg";
const height = 400;
const width = 600;

(async () => {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const inputFilePath = inputFile;
  const outputFilePath = outputFile;
  const tempDirPath = tempDir;

  const ffmpegCommand = `bash -c "${ffmpegPath} -i '${inputFilePath}' -vf 'scale=${width}:${height}' -r ${fps} '${tempDirPath}/frame_%04d.png'"`;

  console.log(`Running command: ${ffmpegCommand}`);

  const { exec } = require("child_process");
  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing ffmpeg: ${error.message}`);
      return;
    }
    console.log(`FFmpeg output: ${stdout}`);
    console.error(`FFmpeg error output: ${stderr}`);

    // Process the frames in tempDir
    fs.readdir(tempDirPath, (err, files) => {
      if (err) {
        console.error(`Error reading temp directory: ${err.message}`);
        return;
      }

      const imagePromises = files.map(async (file) => {
        const filePath = path.join(tempDirPath, file);
        const image = await jimp.Jimp.read(filePath);
        const resizedImage = image.resize({ w: width, h: height });

        // Get pixel data as hex values
        let pixelData = "";
        for (let y = 0; y < height; y++) {
          let row = "";
          for (let x = 0; x < width; x++) {
            const color = resizedImage.getPixelColor(x, y);
            const hex =
              "0x" + (color >>> 8).toString(16).toUpperCase().padStart(6, "0");
            row += hex + " ";
          }
          pixelData += row.trim() + "\n";
        }
        pixelData += "-\n"; // Frame separator
        return Buffer.from(pixelData);
      });

      Promise.all(imagePromises)
        .then((buffers) => {
          // Create the output file
          fs.writeFileSync(outputFilePath, Buffer.concat(buffers));
          console.log(`Output file created: ${outputFilePath}`);
          fs.rmdirSync(tempDirPath, { recursive: true });
        })
        .catch((err) => {
          console.error(`Error processing images: ${err.message}`);
        });
    });
  });
})();
