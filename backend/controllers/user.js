const user = require('../models/user')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            let newUser = new user({
                email: req.body.email,
                password: hash
            })
            newUser.save()
                .then(() => res.status(201).json({ message: "Utilisateur enregistré" }))
                .catch((error) => res.status(403).json({ message: "Cet email existe déjà" }));
        }
        )
}

exports.login = (req, res, next) => {
    user.findOne({ email: req.body.email })
        .then(user => {

            if (!user) {
                res.status(404).json({ message: "Utilisateur non trouvé" })
            }

            else {
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            res.status(401).json({ message: "Mot de passe non valable" })
                        }
                        else {
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    process.env.RANDOM_TOKEN_SECRET,
                                    { expiresIn: '24h' }
                                )
                            })
                        }
                    })
            }
        })
}