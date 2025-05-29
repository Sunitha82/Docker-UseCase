const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Order Processor API is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});