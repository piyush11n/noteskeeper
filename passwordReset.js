const express = require('express');
const router = express.Router();
const session = require('express-session');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const bcrypt = require('bcrypt');
const async = require('async');
const crypto = require('crypto');
const User = require("../model/admin");

router.post('/', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    console.log('error', 'No account with that email address exists.' +{ email: req.body.name});
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'piyushadaniyanov@gmail.com',
                    pass: 'Kamleshverma11'
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'piyushadaniyanov@gmail.com',
                subject: 'NotesKeeper Password Reset',
                text: 'This is to inform you , that you have been applied for changing noteskeeper\'s password\n\n' +
                    'Please click on the following link, or copy & paste this into your browser to complete the process:\n\n' +
                    'http://localhost:4200/admin-panel/changePassword/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                // req.flash
                console.log('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});





router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            console.log('error', 'Password reset token is invalid or has expired.');
            // return res.redirect('/forgot');
        }
        res.render('reset', {
            user: req.user
        });
    });
});

//
// router.post('/reset/:token', function(req, res) {
//     async.waterfall([
//         function(done) {
//             User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
//                 console.log('error hai '+err);
//                 if (!user) {
//                     console.log('error', 'Password reset token is invalid or has expired.');
//                 }
//
//
//                 bcrypt.hash(req.body.password,10, (hash) => {
//                     user.password = hash;
//                     user.resetPasswordToken = undefined;
//                     user.resetPasswordExpires = undefined;
//
//                     user.save(function(err) {
//                             done(err, user);
//
//                     });
//
//                 });
//
//
//
//             });
//
//         },
//         function(user, done) {
//             var smtpTransport = nodemailer.createTransport({
//                 service: 'Gmail',
//                 auth: {
//                     user: 'piyushadaniyanov@gmail.com',
//                     pass: 'Kamleshverma11'
//                 }
//             });
//             var mailOptions = {
//                 to: user.email,
//                 from: 'piyushadaniyanov@gmail.com',
//                 subject: 'Your password has been changed',
//                 text: 'Hello,\n\n' +
//                     'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
//             };
//             smtpTransport.sendMail(mailOptions, function(err) {
//                 console.log('success', 'Success! Your password has been changed.');
//                 done(err);
//             });
//         }
//     ], function(err) {
//         // res.redirect('/');
//         console.log('hooooo!!!!!'+err);
//
//     });
// });
router.post('/reset/:token', function(req, res) {
    console.log('token:'+req.params.token);
        User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        }).exec(function(err, user) {
            if (!err && user) {
                if (req.body.newPassword === req.body.verifyPassword) {
                    user.password = bcrypt.hashSync(req.body.newPassword, 10);
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
                    user.save(function(err) {
                        if (err) {
                            return res.status(422).send({
                                message: err
                            });
                        } else {
                            console.log('eee');
                            console.log('pass'+user.password+ req.body.newPassword);
            //                 var smtpTransport = nodemailer.createTransport({
            //     service: 'Gmail',
            //     auth: {
            //         user: 'piyushadaniyanov@gmail.com',
            //         pass: 'Kamleshverma11'
            //     }
            // });
            // var mailOptions = {
            //     to: user.email,
            //     from: 'piyushadaniyanov@gmail.com',
            //     subject: 'Your password has been changed',
            //     text: 'Hello,\n\n' +
            //         'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            // };
            // smtpTransport.sendMail(mailOptions, function(err) {
            //     console.log('success', 'Success! Your password has been changed.');
            //     done(err);
            // });
                        }
                    });
                } else {
                    return res.status(422).send({
                        message: 'Passwords do not match'
                    });
                }
            } else {
                return res.status(400).send({
                    message: 'Password reset token is invalid or has expired.'
                });
            }
        });
    });

//
// router.patch("/:id", (req, res, next) => {
//     const  id = req.params.id;
//     const updatePass = {};
//     for (const pass of req.body) {
//
//         updatePass[pass.newPass] = password;
//     }
//     Admin.update({_id: id}, {$set: updatePass}).exec().then(result => {
//         console.log(result);
//         res.status(200).json(result);
//     })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json({
//                 error: err
//             }) ;
//         });
// });
module.exports = router;