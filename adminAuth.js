const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const AdminAuth  = require('../model/adminAuth');
const nodemailer = require('nodemailer');

router.get('/',(req, res, next) => {
    AdminAuth.find()
        .select("_id first_name middle_name last_name department email  ")
        .exec()
        .then(docs => {
            res.status(200).json( docs.map(doc => {
                return {
                    first_name: doc.first_name,
                    middle_name: doc.middle_name,
                    last_name: doc.last_name,
                    department: doc.department,
                    email: doc.email,
                    _id: doc._id ,
                    request: {
                        type: "GET",
                        url: 'http://localhost:9000/adminAuth/'+doc._id
                    }
                }

            }
            ));

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});



router.post('/addTeacher',(req, res, next) => {
    const admin = new AdminAuth({
        _id: new mongoose.Types.ObjectId(),
        first_name: req.body.first_name,
        middle_name: req.body.middle_name,
        last_name: req.body.last_name,
        department: req.body.department,
        email: req.body.email,

    });
    admin.save().then(result => {
        console.log(result);
        res.status(200).json({
            message: 'You have Added teacher sucessfully..!!!!',
            createdTeacher: {
                first_name: result.first_name,
                middle_name: result.middle_name,
                last_name: result.last_name,
                department: result.department,
                email: result.email,
                _id: result._id,
                request: {
                    type: "GET",
                    url: 'http://localhost:9000/adminAuth/'+ result._id
                }
            }

        });
        var smtpTrans = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'ppiiyushadaniya@gmail.com',
                pass: 'Kamleshverma11'
            }
        });
        var mailOptions = {
            to: result.email,
            from: 'ppiiyushadaniya@gmail.com',
            subject: 'Register as teacher on notekeeper',
            text: 'Your email id' +result.email + 'has been added to NotesKeeper. Please register now'
        };
        smtpTrans.sendMail(mailOptions, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log('Message sent: %s');
        });



    })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })});

});

// router.get('/signup',(req, res, next) => {
//     AdminAuth.find()
//         .select("_id first_name middle_name last_name department email  ")
//         .exec()
//         .then(docs => {
//             res.status(200).json( docs.map(doc => {
//                 return {
//                     first_name: doc.first_name,
//                     middle_name: doc.middle_name,
//                     last_name: doc.last_name,
//                     department: doc.department,
//                     email: doc.email,
//                     password: doc.password,
//                     _id: doc._id ,
//                     request: {
//                         type: "GET",
//                         url: 'http://localhost:9000/adminAuth/'+doc._id
//                     }
//                 }
//             }));
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json({
//                 error: err
//             });
//         });
// });
//
//
router.get('/:emailId',( req, res, next) => {
    const id = req.params.emailId;
    AdminAuth.find({email: id})
        .exec()
        .then(doc => {
            console.log("from database", doc);
            if(doc){
                res.status(200).json(doc);
            }else{
                res.status(404).json({message: "no valid id"})
            }
            res.status(200).json(doc);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: error});
        });
});
// router.post('/signup', (req, res ,next) => {
//     AdminAuth.find({email: req.body.email})
//         .exec()
//         .then(user => {
//             if(user.length>= 1) {
//                 return res.status(409).json({
//                     message: 'Mail exits'
//                 });
//             }
//             else {
//                 bcrypt.hash(req.body.password, 10, (err, hash) =>{
//                     if(err) {
//                         return res.status(500).json({
//                             error: err
//                         })
//                     }
//                     else {
//                         const adminAuth = new AdminAuth({
//                             _id: new mongoose.Types.ObjectId(),
//                             first_name: req.body.first_name,
//                             middle_name: req.body.middle_name,
//                             last_name: req.body.last_name,
//                             department: req.body.department,
//                             email: req.body.email,
//
//                         });
//                         adminAuth.save()
//                             .then(result => {
//                                 console.log(result);
//                                 res.status(201).json({
//                                     message: 'created'
//                                 });
//                             })
//                             .catch(err => {
//                                 console.log(err);
//                                 res.status(500).json({
//                                     error: err
//                                 })
//                             })
//                     }
//                 })
//
//             }
//         });
// });
// router.post("/login",(req, res, next) => {
//     AdminAuth.find({ email: req.body.email })
//         .exec()
//         .then(user => {
//             if(user.length <1) {
//                 return res.status(401).json({
//                     message: 'auth failed'
//                 });
//             }
//             bcrypt.compare(req.body.password, user[0].password,(err ,result)=> {
//                 if(err) {
//                     return res.status(401).json({
//                         message: 'auth faildedd'
//                     });
//
//                 }
//                 if(result) {
//                const token = jwt.sign({
//                         email: user[0].email,
//                         userId: user[0]._id
//                     },
//                         process.env.JWT_KEY ,
//                         {
//                             expiresIn: "1h"
//                         }
//                         );
//                     return res.status(200).json({
//                         message: 'success',
//                         token: token
//                     });
//                 }
//                 res.status(401).json({
//                     message: 'failed'
//                 })
//             })
//         })
//         .catch()
// });
router.delete("/:userId",(req, res, next) => {
    AdminAuth.remove({_id: req.params.userId})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "user deleted"
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
    });
});
module.exports = router;