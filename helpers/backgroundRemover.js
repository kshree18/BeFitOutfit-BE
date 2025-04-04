const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function removeBackground(inputBuffer) {
    try {
        console.log("Starting background removal with local Python implementation...");
        
        // Create a temporary file for the input
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
        
        const inputPath = path.join(tempDir, `input_${Date.now()}.jpg`);
        const outputPath = path.join(tempDir, `output_${Date.now()}.png`);
        
        // Write the input buffer to a temporary file
        fs.writeFileSync(inputPath, inputBuffer);
        
        // Run the Python script
        return new Promise((resolve, reject) => {
            const pythonProcess = spawn('python', [
                path.join(__dirname, '../background_remover.py'),
                inputPath,
                outputPath
            ]);

            let errorOutput = '';

            pythonProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
                console.error(`Python Error: ${data}`);
            });

            pythonProcess.on('close', (code) => {
                // Clean up the input file
                fs.unlinkSync(inputPath);
                
                if (code !== 0) {
                    console.error("Background removal failed with code:", code);
                    console.error("Error output:", errorOutput);
                    reject(new Error(`Background removal failed with code ${code}`));
                    return;
                }

                // Read the processed image
                const processedBuffer = fs.readFileSync(outputPath);
                
                // Clean up the output file
                fs.unlinkSync(outputPath);
                
                console.log("Background removal completed successfully");
                resolve(processedBuffer);
            });
        });
    } catch (error) {
        console.error("Error removing background:", error.message);
        throw new Error(`Background removal failed: ${error.message}`);
    }
}

module.exports = {
    removeBackground
}; 