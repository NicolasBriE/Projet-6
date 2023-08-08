require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const routeUser = require("./routes/user")
const routeSauce = require("./routes/sauces")

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGOOSE_PASS,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !', err));

app.use(cors());
app.use(express.json());


app.use('/images', express.static(path.join(__dirname, 'images')));
app.use("/api/auth", routeUser)
app.use("/api/sauces", routeSauce)


module.exports = app;

