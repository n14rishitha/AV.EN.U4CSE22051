const express = require("express");
const axios = require("axios");
const app = express();
const PORT = 9876;

const WINDOW_SIZE = 10;
let numberWindow = [];

async function fetchNumbers(numberId) {
  const endpoints = {
    'p': 'primes',
    'f': 'fibo',
    'e': 'even',
    'r': 'rand'
  };
  const url = `http://20.244.56.144/evaluation-service/${endpoints[numberId]}`;
  
  try {
    const response = await axios.get(url, {
      timeout: 500,
      headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ3MDU2ODA3LCJpYXQiOjE3NDcwNTY1MDcsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjU2NmJjZWMyLTU1YzQtNDQyMi04YmVlLWMxNmVmNzg2MDhhMSIsInN1YiI6ImF2LmVuLnU0Y3NlMjIwNTFAYXYuc3R1ZGVudHMuYW1yaXRhLmVkdSJ9LCJlbWFpbCI6ImF2LmVuLnU0Y3NlMjIwNTFAYXYuc3R1ZGVudHMuYW1yaXRhLmVkdSIsIm5hbWUiOiJyaXNoaXRoYSAgbmFuZGFuYXB1Iiwicm9sbE5vIjoiYXYuZW4udTRjc2UyMjA1MSIsImFjY2Vzc0NvZGUiOiJTd3V1S0UiLCJjbGllbnRJRCI6IjU2NmJjZWMyLTU1YzQtNDQyMi04YmVlLWMxNmVmNzg2MDhhMSIsImNsaWVudFNlY3JldCI6Ik5FcGt1ZWRGbnNtZWp3cnAifQ.rIsyBQGACWMCar5sF9xiDvai-3akEfaKJgnwHSQgAwM"  // Replace with your token
      }
    });
    return response.data.numbers || [];
  } catch (error) {
    console.error("Error fetching numbers:", error.message);
    return [];
  }
}

function updateWindow(newNumbers) {
  const uniqueNewNumbers = [...new Set(newNumbers)];
  let prevWindow = [...numberWindow];

  uniqueNewNumbers.forEach(num => {
    if (!numberWindow.includes(num)) {
      if (numberWindow.length >= WINDOW_SIZE) {
        numberWindow.shift();
      }
      numberWindow.push(num);
    }
  });

  const avg = numberWindow.length > 0 
    ? (numberWindow.reduce((a, b) => a + b, 0) / numberWindow.length).toFixed(2)
    : 0;

  return { prevWindow, avg };
}

app.get("/numbers/:numberId", async (req, res) => {
  const { numberId } = req.params;
  const validIds = ['p', 'f', 'e', 'r'];

  if (!validIds.includes(numberId)) {
    return res.status(400).json({ error: "Invalid number ID. Use 'p', 'f', 'e', or 'r'." });
  }

  const numbers = await fetchNumbers(numberId);
  const { prevWindow, avg } = updateWindow(numbers);

  res.json({
    windowPrevState: prevWindow,
    windowCurrState: numberWindow,
    numbers: numbers,
    avg: parseFloat(avg)
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});