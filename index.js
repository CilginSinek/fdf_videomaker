const fs = require("fs");
const path = require("path");
const jimp = require("jimp");

const fps = 10;
const outputFile = "output.fdfs";
const inputFile = "bad apple.mp4";
const tempDir = "temp_f";
const ffmpegPath = "./ffmpeg/ffmpeg";
const height = 300;
const width = 400;

(async () => {
  fs.rmdirSync(tempDir, { recursive: true });
  fs.mkdirSync(tempDir, { recursive: true });

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

      // Clear output file first
      fs.writeFileSync(outputFilePath, '');
      
      // Sort files to ensure correct order
      files.sort();
      
      const processFrame = async (file, index) => {
        try {
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
          
          // Append to output file immediately
          fs.appendFileSync(outputFilePath, pixelData);
          console.log(`Processed frame ${index + 1}/${files.length}: ${file}`);
        } catch (err) {
          console.error(`Error processing frame ${file}: ${err.message}`);
        }
      };

      // Process frames sequentially to avoid memory issues
      const processAllFrames = async () => {
        for (let i = 0; i < files.length; i++) {
          await processFrame(files[i], i);
        }
        console.log(`Output file created: ${outputFilePath}`);
        fs.rmdirSync(tempDirPath, { recursive: true });
      };

      processAllFrames().catch((err) => {
        console.error(`Error processing images: ${err.message}`);
      });
    });
  });
})();
