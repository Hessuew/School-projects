'use strict'

var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var app = express();
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Customer'
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

// Hae asiakastyypit
app.get("/api/asiakas/tyypit", (req, res, next) => {
    con.query('SELECT avain, lyhenne, selite FROM asiakastyyppi', function (err, result, fields) {
        if (err) {
            console.log('Virhe haettaessa dataa Asiakastyyppi-taulusta, syy: ' + err);
            res.status(500).json({ 'status': 'not ok', 'status_text': err.sqlMessage });
        } else {
            console.log(JSON.stringify(result));
            res.status(200).json(result);
        }
    });
});

// Hae asiakkaat
app.get("/api/asiakas/haku", (req, res, next) => {
    var nimi = req.query.nimi || '';
    var osoite = req.query.osoite || '';
    var asty_avain = req.query.asty_avain || '';

    var kysely = 'SELECT avain, nimi, osoite, postinro, postitmp, DATE_FORMAT(luontipvm, "%Y-%m-%d") as luontipvm, asty_avain FROM asiakas WHERE nimi LIKE ' + con.escape(nimi + '%') + ' AND osoite LIKE ' + con.escape(osoite + '%');
    if (asty_avain !== '') {
        kysely += ' AND asty_avain=' + Number(asty_avain);
    }

    console.log("haku :" + kysely);

    con.query(kysely, function (err, result, fields) {
        if (err) {
            console.log('Virhe haettaessa dataa Asiakas-taulusta, syy: ' + err);
            res.status(500).json({ 'status': 'not ok', 'status_text': err.sqlMessage });
        } else {
            console.log(JSON.stringify(result));
            res.status(200).json(result);
        }
    });
});

// Poista asiakas
app.get("/api/asiakas/poista", (req, res, next) => {
    var avain = req.query.avain || '';

    con.query('DELETE FROM asiakas WHERE avain = ?', [avain], function (err, result, fields) {
        if (err) {
            console.log('Virhe poistettaessa dataa Asiakas-taulusta, syy: ' + err);
            res.status(500).json({ 'status': 'not ok', 'status_text': err.sqlMessage });
        } else {
            console.log(JSON.stringify(result));
            res.status(200).json({ 'status': 'ok', 'status_text': result.affectedRows + ' rows deleted' });
        }
    });
});

// Lis�� asiakas
app.post("/api/asiakas/lisaa", (req, res, next) => {
    if (typeof req.body.nimi === "undefined") {
        res.json({ "status": "not ok", "status_text": "nimi-kentt\u00e4 puuttuu" });
    }
    if (typeof req.body.osoite === "undefined") {
        res.json({ "status": "not ok", "status_text": "osoite-kentt\u00e4 puuttuu" });
    }
    if (typeof req.body.postinro === "undefined") {
        res.json({ "status": "not ok", "status_text": "postinro-kentt\u00e4 puuttuu" });
    }
    if (typeof req.body.postitmp === "undefined") {
        res.json({ "status": "not ok", "status_text": "postitmp-kentt\u00e4 puuttuu" });
    }
    if (typeof req.body.asty_avain === "undefined") {
        res.json({ "status": "not ok", "status_text": "asty_avain-kentt\u00e4 puuttuu" });
    } else {
        var avain = Number(req.body.asty_avain);
    }

    con.query('INSERT INTO asiakas(nimi, osoite, postinro, postitmp, luontipvm, asty_avain) VALUES (?, ?, ?, ?, CURDATE(), ' + avain + ')', [req.body.nimi, req.body.osoite, req.body.postinro, req.body.postitmp], function (err, result, fields) {
        if (err) {
            console.log('Virhe lis\u00e4tt\u00e4ess\u00e4 dataa Asiakas-tauluun, syy: ' + err);
            res.status(500).json({ 'status': 'not ok', 'status_text': err.sqlMessage });
        } else {
            console.log(JSON.stringify(result));
            res.status(200).json({ 'status': 'ok', 'status_text': result.affectedRows + ' rows added' });
        }
    });
});

// 404 virhett�, jos kutsu ei t�sm�� edell� oleviin osoitteisiin/metodeihin
app.use(function (req, res, next) {
    res.send(404);
});


// Kuunnellaan porttia 3000 osoitteessa 127.0.0.1
app.listen(3000, '127.0.0.1', () => {
    console.log("Server running at http://127.0.0.1:3000/");
});