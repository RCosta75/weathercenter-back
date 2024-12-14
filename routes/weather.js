var express = require("express");
var router = express.Router();

const City = require("../models/cities");
const User = require("../models/users");

const OWM_API_KEY = process.env.OWM_API_KEY;


// Route pour retirer ville dans user.cities[]
router.put("/disupdate" , (req,res) => {
  User.findOne({token : req.body.token})
  .then((data) => {
    
    if(!data){
      res.json({result : false , infos : "User not found"})
    }
      User.updateOne(
        { token: data.token },
        { $pull: { cities : req.body.id } }
      ).then(() => {
        res.json({ result: true, info: "City deleted" });
      });
    
  })
})


// route post newCity et push user.cities.push(newCity._id) VALIDE
router.post("/newpost", (req, res) => {
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${req.body.cityName}&appid=${OWM_API_KEY}&units=metric`)
        .then((response) => response.json())
        .then((apiData) => {
          if (apiData.main) {

            City.findOne({apiId : apiData.id})
            .then((cityData) => {
              if(!cityData){
                const newCity = new City({
                  cityName: req.body.cityName,
                  country: apiData.sys.country,
                  lat: apiData.coord.lat,
                  long: apiData.coord.lon,
                  apiId: apiData.id,
                });
                newCity.save().then((data) => {
                  User.updateOne(
                    { token: req.body.token },
                    { $push: { cities: data._id } }
                  ).then(() => {
                    res.json({
                      result: true,
                      info: "City has been saved",
                      newCity: data,
                    });
                  });
                });
              } else {
                User.findOne({token : req.body.token})
                .then((user) => {
                  if(user.cities.includes(cityData._id)){
                    res.json({result : false , info : 'City already saved'})
                  } else {
                    User.updateOne({token : req.body.token}, {$push : {cities : cityData._id}})
                    .then(() => {
                      res.json({result : true , info : "City has been saved"})
                    })
                  }
                })
              }
            })

          } else {
            res.json({ result: false, info: "No city found" });
            console.log("No city found");
          }

        })

});


// route pour donnée de une seule ville en temps réel
router.get("/getOne/:city" , (req,res) => {
  const city = req.params.city
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OWM_API_KEY}&units=metric`)
  .then((response) => response.json())
  .then((apiData) => {
    if(apiData.main){
      const newCity = {
        main : apiData?.weather[0]?.main,
        description : apiData.weather[0].description,
        tempMax : apiData.main.temp_max,
        tempMin : apiData.main.temp_min,
        tempNow : apiData.main.temp,
        humidity : apiData.main.humidity,
        wind : apiData.wind.speed,
        country : apiData.sys.country,
        sunset : apiData.sys.sunset,
        sunrise : apiData.sys.sunrise,
        feelLike : apiData.main.feels_like,
      }
      res.json({result : true , newCity})
    } else {
      res.json({result : false , info : "No city Found"})
    }

  })
})
  
router.get("/gets/:city" , (req,res) => {
  const city = req.params.city
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${OWM_API_KEY}&units=metric`)
  .then((response) => response.json())
  .then((apiData) => {
  
      if(apiData){
        res.json({result : true , weather : apiData.list})
      } else {
        res.json({result : false })
      }


  })


})




module.exports = router;
