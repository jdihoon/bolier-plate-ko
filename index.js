// mongodb+srv://jdihoon:<mdmc7508!@#>@cluster0.9u28y7a.mongodb.net/?retryWrites=true&w=majority

const express = require('express')
const app = express()
const port = 4000

const mongoose = require('mongoose');
const url = 'mongodb+srv://jdihoon:mdmc7508@cluster0.9u28y7a.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(url)
  .then(() => console.log('MongoDB Connnected...'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
