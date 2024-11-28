const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const port = 3000;

// Route to get recommendations
app.get('/api/recommendations', (req, res) => {
  const { category, city } = req.query;

  // Validate input parameters
  if (!category || !city) {
    return res.status(400).send('Category and city parameters are required.');
  }

  // Path to the Python executable inside the virtual environment
  const pythonPath = path.join(__dirname, '../.venv/Scripts/python.exe');  // Adjust for your system (Linux: ../.venv/bin/python)
  const scriptPath = path.join(__dirname, '../script/rekomendasi.py');

  // Spawn the Python process and pass the parameters
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

  // Handle process completion
  pythonProcess.on('close', (code) => {
    if (code === 0) {
      try {
        // Parse the JSON response from the Python script
        const result = JSON.parse(dataBuffer);
        res.json(result);  // Send JSON response to the client
      } catch (error) {
        console.error('JSON Parse Error:', error);
        res.status(500).send('Error parsing Python response');
      }
    } else {
      res.status(500).send('Error executing Python script');
    }
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
