const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const  Uploads = require('../model/uploads');
const multer = require('multer');

//code for uploading file
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./uploads/");
    },
    filename: function (req, file, callback) {
        callback(null,file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

//file filter
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'application/pdf' || file.mimetype === 'text/plain' ) {
        cb(null, true);
    } else  {
        cb(null, false);
    }
};


const upload = multer({storage: storage , fileFilter: fileFilter  });


router.get('/',(req, res, next) => {
    Uploads.find()
        .select("_id subject topic description semister branch date fileUpload teacherId")
        .exec()
        .then(docs => {
            res.status(200).json( docs.map(doc => {
                return {
                    subject: doc.subject,
                    topic: doc.topic,
                    description: doc.description,
                    semister: doc.semister,
                    branch: doc.branch,
                    date: doc.date,
                    fileUpload: doc.fileUpload,
                    _id: doc._id ,
                    teacherId: doc.teacherId,
                    request: {
                        type: "GET",
                        url: 'http://localhost:9000/uploads/'+doc._id,
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


router.get('/email/:teacherId',( req, res, next) => {
    const id = req.params.teacherId ;
    Uploads.find({"teacherId": id } )
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

router.get('/:branch',( req, res, next) => {
    const id = req.params.branch;
    Uploads.find({"branch": id })
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

router.post('/',upload.single('fileUpload'),(req, res, next) => {
console.log(req.file);
    const uploads = new Uploads({
        _id: new mongoose.Types.ObjectId(),
        subject: req.body.subject,
        topic: req.body.topic,
        description: req.body.description,
        semister: req.body.semister,
        branch:req.body.branch,
        date: req.body.date,
        fileUpload: req.file.path,
        teacherId:  req.body.teacherId,
        teacherName:  req.body.teacherName
    });
    uploads.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: 'handle post ohh  yeah ohh yeah',
            createdTeacher: {
                _id: result._id,
                subject: result.subject,
                topic: result.topic,
                description: result.description,
                semister: result.semister,
                branch: result.branch,
                date: result.date,
                fileUpload: result.fileUpload,
                teacherId:  result.teacherId,
                teacherName:  result.teacherName
            }
        });
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })});

});

router.get('/uploads/:file(*)',(req, res) => {
        var file = req.params.file;
    var fileLocation = path.join('./uploads',file);
    console.log(fileLocation);
    res.download(fileLocation, file);


});

router.delete("/:Id",(req, res, next) => {
    const id = req.params.Id;
    Uploads.remove({_id: id})
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