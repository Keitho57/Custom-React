const express = require("express");
const app = express();
const path = require("path");
const PORT = 8080;

app.get("/", (req,res)=>{
 res.sendFile(path.join(__dirname,"src/index.js")); //folderName is optional
// res.send("Hello World")//sends just text
})


app.listen(PORT, () => {
  console.log("listening");
});