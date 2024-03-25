const mysql = require('mysql');

var pool = mysql.createPool({
    "user" : "root",
    "password": "4rth1802",
    "database": "api_todo",
    "host": "localhost",
    "port": 3306
});


exports.pool = pool;