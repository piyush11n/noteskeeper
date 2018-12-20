const express = require('express');
const app = express();
const morgan = require('morgan');
const nodemailer = require('nodemailer');
const MongoClient = require('mongodb').MongoClient;

const bodyParse = require('body-parser');
const mongoose = require('mongoose');

const adminAuthRoutes = require('./api/routes/adminAuth');
const testRoutes = require('./api/routes/testApi');
const adminRoutes = require('./api/routes/admin');
const uploadRoutes = require('./api/routes/uploads');
const studentRoutes = require('./api/routes/students');
const studentRegistrationRoutes = require('./api/routes/studentRegistration');
const teacherRegistrationRoutes = require('./api/routes/teacherRegistration');
const forgetPassword =  require('./api/routes/passwordReset');
mongoose.connect("mongodb://Noteskeeper:Kamleshverma11$@notekeeper-shard-00-00-0scfq.mongodb.net:27017,notekeeper-shard-00-01-0scfq.mongodb.net:27017,notekeeper-shard-00-02-0scfq.mongodb.net:27017/test?ssl=true&replicaSet=Notekeeper-shard-0&authSource=admin&retryWrites=true",
{
 useNewUrlParser: true
});
// 'mongodb://localhost/db',{ useNewUrlParser: true }
mongoose.Promise = global.Promise;
app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));
app.use(bodyParse.urlencoded({extended: false}));
app.use(bodyParse.json());


// add cors
const cors = require('cors');
app.use(cors({
    origin:'*',
    Methods: 'GET, OPTION, POST, PUT, PATCH, DELETE'
}));

// CORS (cross orign resourse sharing) this is for security reason
//
app.use((req, res ,next) => {
    res.header('Access-control-Allow-Orign','*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'GET, OPTION, POST, PUT, PATCH, DELETE');
        return res.status(200).json({});
    }
    next();
});
app.use('/students', studentRoutes);
app.use('/test', testRoutes);
app.use('/studentRegistration', studentRegistrationRoutes);
app.use('/teacherRegistration', teacherRegistrationRoutes);
app.use('/adminAuth', adminAuthRoutes);
app.use('/uploads', uploadRoutes);
app.use('/admin', adminRoutes);
app.use('/forget' ,forgetPassword);
//Error handling!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.use((req, res, next) => {
    const error = new  Error('not found');
    error.status =404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});


module.exports = app;
