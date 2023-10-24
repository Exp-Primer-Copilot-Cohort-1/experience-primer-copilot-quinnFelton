// Create web server for comment page
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var fs = require('fs');
var mysql = require('mysql');
var db = require('./db');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

// Create connection to database
var connection = mysql.createConnection({
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.database,
    port: db.port
});

// Use session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
        host: db.host,
        user: db.user,
        password: db.password,
        database: db.database,
        port: db.port
    })
}));

// Use body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Set static path
app.use('/static', express.static(path.join(__dirname, 'public')));

// Set port
app.listen(3000);

// Set route
app.get('/', (req, res) => {
    res.render('comment');
});

app.post('/', (req, res) => {
    var name = req.body.name;
    var comment = req.body.comment;
    var sql = "INSERT INTO comment (name, comment) VALUES ('" + name + "', '" + comment + "')";
    connection.query(sql, (err, result) => {
        if (err) throw err;
        console.log("1 record inserted");
    });
    res.redirect('/');
});

app.get('/comment', (req, res) => {
    var sql = "SELECT * FROM comment";
    connection.query(sql, (err, result) => {
        if (err) throw err;
        res.render('comment', { result: result });
    });
});

app.get('/delete/:id', (req, res) => {
    var id = req.params.id;
    var sql = "DELETE FROM comment WHERE id = '" + id + "'";
    connection.query(sql, (err, result) => {
        if (err) throw err;
        console.log("1 record deleted");
    });
    res.redirect('/comment');
});

app.get('/edit/:id', (req, res) => {
    var id = req.params.id;
    var sql = "SELECT * FROM comment WHERE id = '" + id + "'";
    connection.query(sql, (err, result) => {
        if (err) throw err;
        res.render('edit', { result: result });
    });
});

app.post('/update/:id', (req, res) => {
    var id = req.params.id;
    var name = req.body.name;
    var comment = req.body.comment;
    var sql = "UPDATE comment SET name = '" + name + "', comment = '" + comment + "' WHERE id = '" + id + "'";
    connection.query(sql, (err, result) => {
        if (err) throw err;
        console.log("1 record updated");
    });
    res.redirect('/comment');
});