const express = require('express')
const app = express();
const upload = require('./uploadHandler')
const path  = require('path');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');



app.use(cors({
     origin: ["http://localhost:3000"], 
  methods: ["GET", "POST", "PUT", "DELETE"], 
    credentials: true,     
      allowedHeaders: ['Content-Type', 'Authorization']
}));


app.get('/', (req, res)=>{
    console.log('route hit')

    return res.json("Hello from server")
})

app.post('/api/disease', upload.single('image'), async(req, res)=>{

   

    

         const base64 = fs.readFileSync(req.file.path).toString('base64')


         axios
         .post("https://dua41p2tz8.execute-api.eu-north-1.amazonaws.com/predict", {

            inputs: base64
         })

         .then((response)=>{

            console.log(response.data)

            return res.json(response.data)
         })
         


    




    console.log("image uyploader hit")

    
})



app.listen(9000, ()=>{

    console.log("server is listening on PORT 9000")
})

