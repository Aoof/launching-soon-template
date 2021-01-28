const express = require("express");
const session = require('express-session')
const path = require('path');
const csrf = require('csurf')
const flash = require('connect-flash')
const app = express();
require('dotenv').config();

let sessionOptions = session({
    secret: process.env.SESSIONSECRET,
    // store: new MySQLStore({
    //     host: 'localhost',
    //     port: 3306,
    //     user: process.env.DBUSER,
    //     password: process.env.DBPASSWORD,
    //     database: process.env.DBNAME
    // }),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true }
});

app.use(sessionOptions);
app.use(flash());

app.use(function(req, res, next) {
    res.locals.errors = req.flash('errors');
    res.locals.success = req.flash('success');
    next();
})

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'static')));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');

app.use(csrf())

app.use(async function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use('/', require('./router'));

app.use(function(err, req, res, next) {
    if (err) {
        if (err.code == "EBADCSRFTOKEN") {
            req.flash('errors', 'Cross-site forgery detected');
            req.session.save(() => res.redirect('back'));
        } else {
            console.log(err);
            res.status(400).send(err);
        }
    }
})


app.listen(process.env.PORT || 8000);
console.log("listening on http://localhost:8000/");

module.exports = app;