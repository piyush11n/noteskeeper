const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const  Test = require('../model/testApi');
// var fs = require("fs");
//
// var obj = {
//     table: []
// };
//
// obj.table.push({id: 1, square:2});
// var json = JSON.stringify(obj);
//
// var fs = require('fs');
// fs.writeFile('myjsonfile.json', json, 'utf8', callback);
// fs.readFile('myjsonfile.json', 'utf8', function readFileCallback(err, data){
//     if (err){
//         console.log(err);
//     } else {
//         obj = JSON.parse(data); //now it an object
//         obj.table.push({id: 2, square:3}); //add some data
//         json = JSON.stringify(obj); //convert it back to json
//         fs.writeFile('myjsonfile.json', json, 'utf8', callback); // write it back
//     }});


router.post('/',(req, res, next) => {
    const student = new Test({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email
    });
    student.save().then(result => {
        console.log(result);
        res.status(200).json({
            message: 'data',
            createdStudent: {
                email: result.email
            }
        });
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })});

});



router.get('/',(req, res, next) => {
    Test.find()
        .select("_id email d")
        .exec()
        .then(docs => {
            res.status(200).json( docs.map(doc => {
                return {
                    d: doc.d,
                    email: doc.email,
                    _id: doc._id ,
                    attendance: {
                        mark: "present"
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

// router.put('/add/:id',( req, res, next) => {
//     Test.findByIdAndUpdate(req.params.id, {
//         email: { d: req.body.d }}, {upsert:true}, function (err, user) {
//         return res.json(true);
//     })
// });
    // Test.findByIdAndUpdate({"email": "pl" } )
    //     .exec()
    //     .then(doc => {
    //         console.log("from database", doc);
    //         if(doc){
    //             res.status(200).json(doc);
    //         }else{
    //             res.status(404).json({message: "no valid id"})
    //         }
    //         res.status(200).json(doc);
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         res.status(500).json({error: error});
    //     });


module.exports = router;