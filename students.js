const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const  Students = require('../model/students');
const checkAuth = require('../middelware/check-auth');

router.get('/',(req, res, next) => {
    Students.find()
        .select("_id name email rollNo branch")
        .exec()
        .then(docs => {
            res.status(200).json( docs.map(doc => {
                return {
                    name: doc.name,
                    email: doc.email,
                    rollNo: doc.rollNo,
                    branch: doc.branch,
                    _id: doc._id ,
                    request: {
                        type: "GET",
                        url: 'http://localhost:9000/students/'+doc._id
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

router.post('/',(req, res, next) => {
    const student = new Students({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        rollNo: req.body.rollNo,
        branch: req.body.branch
    });
    student.save().then(result => {
        console.log(result);
        res.status(200).json({
            message: 'handle post ohh  yeah ohh yeah',
            createdStudent: {
                name: result.name,
                email: result.email,
                rollNo: result.rollNo,
                branch: result.branch,
                _id: result._id,
                request: {
                    type: "GET",
                    url: 'http://localhost:9000/students/'+ result._id
                }
            }
        });
        var smtpTrans = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'noteskeeper.ang@gmail.com',
                pass: 'Kamleshverma11'
            }
        });
        var mailOptions = {
            to: result.email,
            from: 'noteskeeper.ang@gmail.com',
            subject: 'Register as student on notekeeper',
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

router.delete("/:userId",(req, res, next) => {
    Students.remove({_id: req.params.userId})
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


router.get('/:emailId',( req, res, next) => {
    const id = req.params.emailId;
    Students.find({email: id})
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
module.exports = router;