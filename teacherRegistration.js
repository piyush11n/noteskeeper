const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const  TeacherRegistration = require('../model/teacherRegistration');
const checkAuth = require('../middelware/check-auth');

router.post('/signup', (req, res ,next) => {
    TeacherRegistration.find({email: req.body.email})
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
                        const teacherRegistration = new TeacherRegistration({
                            _id: new mongoose.Types.ObjectId(),
                            name: req.body.name,
                            email: req.body.email,
                            department: req.body.department,
                            password: hash
                        });
                        teacherRegistration.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'you have registered successfully ',
                                    createdTeacher: {
                                        _id: result._id,
                                        name: result.name,
                                        email:  result.email,
                                        rollNo: result.rollNo,
                                        branch: result.branch,
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


router.get('/signup',(req, res, next) => {
    TeacherRegistration.find()
        .select("_id name email  department password ")
        .exec()
        .then(docs => {
            res.status(200).json( docs.map(doc => {
                return {
                    name: doc.name,
                    email: doc.email,
                    department: doc.department,
                    password: doc.password,
                    _id: doc._id ,
                    request: {
                        type: "GET",
                        url: 'http://localhost:9000/teacherRegistration/'+doc._id
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
    TeacherRegistration.find({ email: req.body.email })
        .exec()
        .then(user => {
            if(user.length <1) {
                return res.status(401).json({
                    message: 'auth failed'
                });
            }
            bcrypt.compare(req.body.password, user[0].password,(err ,result)=> {
                if(err) {
                    return res.status(401).json({
                        message: 'auth faildedd'
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
                    return res.status(200).send({token})
                }
                res.status(401).json({
                    message: 'failed'
                })
            })
        })
        .catch()
});

router.delete("/:Id",(req, res, next) => {
    const id = req.params.Id;
    TeacherRegistration.remove({_id: id})
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