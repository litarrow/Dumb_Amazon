﻿module.exports = function () {
	var express = require('express');
	var router = express.Router();

	function getPayment(res, mysql, context, complete) {
		mysql.pool.query("SELECT id, user_id, fname, lname, street, city, zip, card_num, exp_month, exp_year FROM payment", function (error, results, fields) {
			if (error) {
				res.write(JSON.stringify(error));
				res.end();
			}
			context.payment = results;
			complete();
		});
	}

	function getAccount(res, mysql, context, complete) {
		mysql.pool.query("SELECT id, username, password, email, fname, lname, street, city, zip FROM account", function (error, results, fields) {
			if (error) {
				res.write(JSON.stringify(error));
				res.end();
			}
			context.account = results;
			complete();
		});
	}

	/* Find categories whose name includes the given string in the req */
	function searchFunction(req, res, mysql, context, complete) {
		//sanitize the input as well as include the % character
		var query = "SELECT id, user_id, fname, lname, street, city, zip, card_num, exp_month, exp_year FROM payment WHERE " + req.query.filter + " LIKE " + mysql.pool.escape('%' + req.query.search + '%');
		console.log(query)
		mysql.pool.query(query, function (error, results, fields) {
			if (error) {
				res.write(JSON.stringify(error));
				res.end();
			}
			context.payment = results;
			complete();
		});
	}

	/*Display all categories. Requires web based javascript to delete users with AJAX*/
	router.get('/', function (req, res) {
		var callbackCount = 0;
		var context = {};
		var mysql = req.app.get('mysql');
		getPayment(res, mysql, context, complete);
		getAccount(res, mysql, context, complete);
		function complete() {
			callbackCount++;
			if (callbackCount >= 2) {
				res.render('payment', context);
			}

		}
	});

	/*Display all categories whose name starts with a given string. */
	router.get('/search', function (req, res) {
		var callbackCount = 0;
		var context = {};
		var mysql = req.app.get('mysql');
		searchFunction(req, res, mysql, context, complete);
		function complete() {
			callbackCount++;
			if (callbackCount >= 1) {
				res.render('payment', context);
			}
		}
	});

	/* Adds a categories, redirects to the categories page after adding */
	router.post('/add', function (req, res) {
		console.log(req.body)
		var mysql = req.app.get('mysql');
		var sql = "INSERT INTO payment (user_id, fname, lname, street, city, zip, card_num, exp_month, exp_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
		var inserts = [req.body.newUserID, req.body.newFname, req.body.newLname,
			req.body.newStreet, req.body.newCity, req.body.newZip, req.body.newCardNum,
			req.body.newExpMonth, req.body.newExpYear];
		sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
			if (error) {
				console.log(JSON.stringify(error))
				res.write(JSON.stringify(error));
				res.end();
			} else {
				res.redirect('/payment');
			}
		});
	});

	/* updates a categories, redirects to the categories page after adding */
	router.post('/update', function (req, res) {
		console.log(req.body)
		var mysql = req.app.get('mysql');
		var sql = "UPDATE payment SET user_id=?, fname=?, lname=?, street=?, city=?, zip=?, card_num=?, exp_month=?, exp_year=? WHERE id = ?";
		var inserts = [req.body.editUserID, req.body.editFname, req.body.editLname,
			req.body.editStreet, req.body.editCity, req.body.editZip, req.body.editCardNum,
			req.body.editExpMonth, req.body.editExpYear, req.body.updateID];
		sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
			if (error) {
				console.log(JSON.stringify(error))
				res.write(JSON.stringify(error));
				res.end();
			} else {
				res.redirect('/payment');
			}
		});
	});

	/* delete a categories, redirects to the categories page after deleting */
	router.post('/delete', function (req, res) {
		var mysql = req.app.get('mysql');
		var sql = "DELETE FROM payment WHERE id = ?";
		var inserts = [req.body.deleteID];
		sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
			if (error) {
				console.log(error)
				res.write(JSON.stringify(error));
				res.status(400);
				res.end();
			} else {
				res.redirect('/payment');
			}
		})
	})

	return router;
}();
