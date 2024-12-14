var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');

const bcrypt = require('bcrypt');
const uid2 = require('uid2');

const OWM_API_KEY = process.env.OWM_API_KEY;


// route signup a changer avec bcrypt
router.post('/signup' , (req,res) => {
  if(!req.body.email || !req.body.password){
    res.json({result : false , infos : 'Missing or empty field'})
    return
  }

  User.findOne({ email: { $regex: new RegExp(req.body.email, 'i') } })
  .then((data) => {
    if(!data) {
      const hash = bcrypt.hashSync(req.body.password, 10);
      const newUser = new User({
        email : req.body.email,
        password : hash,
        token : uid2(32),
      })
      newUser.save().then((data) => {
        res.json({result : true, data })
      })
    }
  })
})

router.post("/signin" , (req,res) => {
  if(!req.body.email || !req.body.password){
    res.json({result : false , infos : 'Missing or empty field'})
    return
  }

  User.findOne({email: { $regex: new RegExp(req.body.email, 'i') }}).then((data) => {
    if (data === null) { 
      res.json({ result: false, error: 'User not found' });
       return; 
      }

      if (bcrypt.compareSync(req.body.password, data.password)) {
        res.json({ result: true, token: data.token, email: data.email});
      } else {
        res.json({ result: false, error: ' wrong password' });
      }
  })
})

// cherche dans user.cities[] le nom des ville, et fetch a l'api pour actualiser la temp
router.get('/cities/:token', (req, res) => {
  User.findOne({ token: req.params.token })
    .populate("cities")
    .then((data) => {
      if (!data) {
        return res.json({ result: false, info: "User not found" });
      }

      if (data.cities.length > 0) {
        const fetchPromises = data.cities.map((city) =>
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city.cityName}&appid=${OWM_API_KEY}&units=metric`
          )
            .then((response) => response.json())
            .then((apiData) => {
              if (!apiData.main || !apiData.weather || !apiData.weather[0]) {
                console.error("Invalid data from OpenWeather API");
                return null; // Exclure cette ville en cas de données manquantes
              }

              return {
                cityName: apiData.name,
                main: apiData.weather[0].main,
                description: apiData.weather[0].description,
                degrees : apiData.main.temp,
                id : city._id
              };
            })
            .catch((error) => {
              console.error(error);
              return null; // Exclure cette ville en cas d'erreur
            })
        );

        Promise.all(fetchPromises)
          .then((results) => {
            const cities = results.filter((city) => city); // Exclure les résultats `null`
            res.json({ result: true, cities });
          })
          .catch((error) => {
            console.error(error);
            res.status(500).json({ result: false, error: "Internal server error" });
          });
      } else {
        res.json({ result: false, info: "No cities found" });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ result: false, error: "Internal server error" });
    });
});


module.exports = router;
