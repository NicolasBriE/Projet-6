const Sauce = require('../models/sauces');
const fs = require('fs')

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((sauces) => res.status(200).json(sauces))
        .catch((error) => res.status(404).json({ message: "Aucune sauce disponible" }))
}

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({ message: "La sauce n'a pas été trouvée" }))
}

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce)

    let newSauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        userId: req.auth.userId,
        likes: 0,
        dislikes: 0
    })
    newSauce.save()
        .then(() => { res.status(201).json({ message: "Sauce enregistrée" }) })
        .catch((error) => res.status(400).json({ message: "Sauce non créée" }));
}

exports.modifySauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: "Vous ne pouvez pas modifier la sauce" })
            }

            else {
                if (req.file) {
                    let imageFileName = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${imageFileName}`, () => {
                        const sauceObject = {
                            ...JSON.parse(req.body.sauce),
                            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                        }
                        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject })
                            .then(() => res.status(201).json({ message: "Vous avez modifié cette sauce" }))
                            .catch((error) => res.status(400).json({ error }))
                    })
                }
                else {
                    const sauceObject = req.body
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject })
                        .then(() => res.status(201).json({ message: "Vous avez modifié cette sauce" }))
                        .catch((error) => res.status(400).json({ error }))
                }
            }
        })
}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: "Vous ne pouvez pas supprimer la sauce" })
            }

            else {
                let imageFileName = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${imageFileName}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(201).json({ message: "sauce supprimée" }) })
                        .catch((error) => res.status(400).json({ message: "La sauce n'a pas pu être supprimée" }))
                })
            }
        })
}

exports.likesAndDislikes = (req, res, next) => {

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (req.body.like === 1) {
                if (sauce.usersLiked.includes(req.auth.userId)) {
                    res.status(400).json({ message: "Vous avez déjà liké cette sauce" })
                }
                else {
                    Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } })
                        .then(() => console.log(sauce))
                        .then(() => res.status(201).json({ message: "Vous avez liké cette sauce" }))
                        .catch((error) => res.status(400).json({ error }))
                }
            }

            else if (req.body.like === -1) {
                if (sauce.usersDisliked.includes(req.auth.userId)) {
                    res.status(400).json({ message: "Vous avez déjà disliké cette sauce" })
                }
                else {
                    Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.auth.userId } })
                        .then(() => console.log(sauce))
                        .then(() => res.status(201).json({ message: "Vous avez disliké cette sauce" }));
                }
            }

            else if (req.body.like === 0) {
                if (sauce.usersLiked.includes(req.auth.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.auth.userId } })
                        .then(() => res.status(201).json({ message: "Vous avez enlevé votre like" }))
                        .catch((error) => res.status(400).json({ error }));
                }                                                                                                           

                else if (sauce.usersDisliked.includes(req.auth.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.auth.userId } })
                        .then(() => res.status(201).json({ message: "Vous avez enlevé votre dislike" }))
                        .catch((error) => res.status(400).json({ error }));
                }
            }
        })
}