var express = require("express");
var router = express.Router();

const MEDIASTACK_API_KEY = process.env.MEDIASTACK_API_KEY;


// route pour recuperer 25 articles selon le pays
router.get("/get/:country" , (req,res) => {
    const country = req.params.country
    fetch(`https://api.mediastack.com/v1/news?access_key=${MEDIASTACK_API_KEY}&countries=${country}`)
    .then((response) => response.json())
    .then((apiData) => {
      
      if(apiData.data){
        res.json({result : true , articles : apiData.data })
      } else {
        res.json({result : false , info : "No Articles Found"})
      }
  
    })
  })

module.exports = router;
