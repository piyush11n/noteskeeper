const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const Admin  = require('../model/admin');
const crypto = require('crypto');

router.post('/signup', (req, res , next) => {
    Admin.find({email: req.body.email})
        .exec()
        .then(user => {
            if(user.length>= 1) {
                return res.status(409).json({
                    message: 'Mail exits'
                });
            }
            else {
                bcrypt.hash(req.body.password, 10, (err, hash) =>{
                    if(err) {
                        return res.status(500).json({
                            error: err
                        })
                    }
                    else {
                        const studentRegistration = new Admin({
                            _id: new mongoose.Types.ObjectId(),
                                     email: req.body.email,
                                     password: hash
                        });
                        studentRegistration.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'created',
                                    createdTeacher: {
                                        _id: result._id,
                                        email:  result.email,
                                        password: result.password
                                    }
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                })
                            })
                    }
                })

            }
        });
});


router.get('/sign',(req, res, next) => {
    Admin.find()
        .select("_id name email rollNo department password ")
        .exec()
        .then(docs => {
            res.status(200).json( docs.map(doc => {
                return {
                    name: doc.name,
                    email: doc.email,
                    rollNo: doc.rollNo,
                    token: doc.password,
                    password: doc.password,
                    _id: doc._id ,
                    request: {
                        type: "GET",
                        url: 'http://localhost:9000/studentRegistration/'+doc._id
                    }
                }
            }));
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


router.post("/login",(req, res, next) => {
    Admin.find({ email: req.body.email })
        .exec()
        .then(user => {
            if(user.length <1) {
                return res.status(401).json({
                    message: 'auth failed burrrr'
                });
            }
            bcrypt.compare(req.body.password, user[0].password,(err ,result)=> {
                if(err) {
                    return res.status(401).json({
                        message: 'auth fail'
                    });

                }
                if(result) {
                    const token = jwt.sign({
                            email: user[0].email,
                            userId: user[0]._id
                        },
                        process.env.JWT_KEY ,
                        {
                            expiresIn: "1h"
                        }
                    );
                    return res.status(200).json({
                        message: 'success',
                        token: token
                    });
                }
                res.status(401).json({
                    message: 'failed'
                })
            })
        })
        .catch()
});

router.patch("/:id", (req, res, next) => {
    const  id = req.params.id;
    const updatePass = {};
    for (const pass of req.body) {

updatePass[pass.newPass] = password;
    }
    Admin.update({_id: id}, {$set: updatePass}).exec().then(result => {
        console.log(result);
        res.status(200).json(result);
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            }) ;
        });
});
router.delete("/:Id",(req, res, next) => {
    const id = req.params.Id;
    Admin.remove({_id: id})
        .exec()
        .then(result => {
            res.status(200).json(result);
        })

        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});
module.exports = router;