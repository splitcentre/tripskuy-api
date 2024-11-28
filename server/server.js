const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const port = 3000;

// Path to Python executable inside the virtual environment
const pythonPath = path.join(__dirname, '../.venv/Scripts/python.exe');  // Adjust path based on your OS
// Path to the Python script
const scriptPath = path.join(__dirname, '../script/rekomendasi.py');

app.get('/api/recommendations', (req, res) => {
  const { category, city } = req.query;

  // Spawn the Python process using the virtual environment's Python interpreter
  const pythonProcess = spawn(pythonPath, [scriptPath, category, city]);

  let dataBuffer = '';

  // Capture standard output (stdout)
  pythonProcess.stdout.on('data', (data) => {
    dataBuffer += data.toString();
  });

  // Capture error output (stderr)
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
    res.status(500).send(`Python Error: ${data}`);
  });

  // When the Python process finishes
  pythonProcess.on('close', (code) => {
    if (code === 0) {
      try {
        // Parse the Python response (assuming it's JSON)
        const result = JSON.parse(dataBuffer);
        res.json(result);  // Send the result back to the client
      } catch (error) {
        console.error('JSON Parse Error:', error);
        res.status(500).send('Error parsing Python response');
      }
    } else {
      res.status(500).send('Error executing Python script');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
