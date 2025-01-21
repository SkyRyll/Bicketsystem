const express = require("express");
const app = express();
const session = require("express-session");
const mysql = require("mysql2");
const md5 = require("md5");
const bodyParser = require("body-parser");
const encoder = bodyParser.urlencoded();
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");

//VARIABLES
const dbHost = "localhost";
const dbUser = "root";
const dbPass = "root";
const dbDatabase = "bicket";
const dbPort = 3306;
const nodeAppPort = 3000;

// expose static path
app.use(express.static("static"));

// set view engine
app.set("view engine", "ejs");

//initialize session
app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// host app on port xxxx
app.listen(nodeAppPort, () => {
    console.log(`App listening at port ${nodeAppPort}`);
    console.log("http://localhost:" + nodeAppPort + "/");
});

//connect to local database
const connection = mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPass,
    database: dbDatabase,
});

// connection test
connection.connect(function (error) {
    if (error) throw error;
    else console.log("connection to database successful");
});

// route pages
app.get("/", (req, res) => {
    get_index(req, res);
});

app.get("/account", (req, res) => {
    get_account(req, res);
});

app.get("/login", (req, res) => {
    get_login(req, res);
});

app.get("/register", (req, res) => {
    get_register(req, res);
});

app.get("/logout", (req, res) => {
    get_logout(req, res);
});

app.get("/error", (req, res) => {
    get_error(req, res);
});

function get_index(req, res) {
    res.render("pages/index", {
        loggedin: req.session.loggedin,
    });
}

function get_account(req, res) {
    //check if user is logged in
    if (req.session.loggedin) {
        show_account(req, res, req.session.userID);
    } else {
        res.redirect("/login");
    }
}

function show_account(req, res, user_id) {
    const query = "SELECT * FROM accounts WHERE account_id = ?";
    connection.query(query, [user_id], function (error, results, fields) {
        if (error) throw error;

        if (results.length > 0) {
            // User found
            const user = results[0];

            // Fetch role based on role_id
            getRoleFromID(user.role_id, function (role) {
                // Don't supply password hash ;)
                delete user.hash;

                res.render("pages/account", {
                    user: user,
                    role: role,
                    loggedin: req.session.loggedin,
                });
            });
        } else {
            // Invalid userID
            get_error(req, res, "No User was found");
        }
    });
}

function getRoleFromID(role_id, callback) {
    const roleQuery = "SELECT * FROM roles WHERE role_id = ?";
    connection.query(roleQuery, [role_id], function (error, results) {
        if (error) throw error;

        const role = results.length > 0 ? results[0] : null;
        callback(role);
    });
}

function get_login(req, res) {
    //check if user is logged in
    if (req.session.loggedin) {
        show_account(req, res, req.session.userID);
    } else {
        res.render("pages/login", {
            loggedin: req.session.loggedin,
        });
    }
}

function get_register(req, res) {
    //check if user is logged in
    if (req.session.loggedin) {
        show_account(req, res, req.session.userID);
    } else {
        res.render("pages/register", {
            loggedin: req.session.loggedin,
        });
    }
}

function get_logout(req, res) {
    //check if user is logged in
    if (req.session.loggedin) {
        do_logout(req, res);
    } else {
        get_error(req, res, "Logout failed. You were not logged in, please login to logout");
    }
}

function do_logout(req, res) {
    //close session
    req.session.username = null;
    req.session.userID = null;
    req.session.password = null;
    req.session.loggedin = false;

    res.redirect("/");
}

function get_error(req, res, errorMessage) {
    res.render("pages/error", {
        loggedin: req.session.loggedin,
        errorMessage: errorMessage,
    });
    res.end();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//login check and redirect
app.post(
    "/login",
    [
        check("email").trim().isLength({ min: 1 }).escape(),
        check("password").trim().isLength({ min: 8 }), // You might want to add more validation here
    ],
    encoder,
    function (req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            get_error(req, res, "Error while trying to log in. The provided data did not meet the requirements");
        } else {
            var email = req.body.email;
            var password = req.body.password;
            const salt = generateSalt(password);

            // Retrieve 'hash' and 'salt' from the database based on the username
            const query = "SELECT * FROM accounts WHERE email = ?";
            connection.query(query, [email], function (error, results, fields) {
                if (error) {
                    get_error(req, res, "Login failed. Please try again.");
                }

                if (results.length > 0) {
                    const storedHash = results[0].hash; // Get the stored hash from the database

                    bcrypt.hash(password, salt, function (err, hash) {
                        if (err) {
                            get_error(req, res, "Login failed. Please try again.");
                        }

                        // Compare 'hash' with 'storedHash' to verify the password
                        if (hash === storedHash) {
                            // Passwords match, grant access
                            req.session.loggedin = true;
                            req.session.userID = results[0].account_id;

                            // Render home page
                            res.redirect("/account");
                        } else {
                            // Passwords do not match, deny access
                            get_error(req, res, "Login failed. Incorrect password.");
                        }
                    });
                } else {
                    // User not found, handle accordingly
                    get_error(req, res, "Login failed. User not found.");
                }
            });
        }
    }
);

// register user
app.post(
    "/register",
    [
        check("email").isEmail().normalizeEmail(),
        check("first_name").trim().isLength({ min: 1 }).escape(),
        check("last_name").trim().isLength({ min: 1 }).escape(),
        check("street").trim().isLength({ min: 1 }).escape(),
        check("house_number").isInt({ gt: 0 }).withMessage("House number must be a positive integer."),
        check("zip_code").isInt({ gt: 0 }).withMessage("ZIP Code must be a positive integer."),
        check("city").trim().isLength({ min: 1 }).escape(),
        check("role").trim().isIn(["teacher", "room_attendant"]).withMessage("Role must be either teacher or room attendant"),
        check("password").custom((value) => {
            // Use a regular expression to validate the password
            const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/;
            if (!passwordRegex.test(value)) {
                get_error(req, res, "Password must have at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.");
            }
            return true;
        }),
    ],
    encoder,
    function (req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            get_error(req, res, "Error while trying to create user. The provided data did not meet the requirements.");
        } else {
            var email = req.body.email;
            var first_name = req.body.first_name;
            var last_name = req.body.last_name;
            var password = req.body.password;
            var street = req.body.street;
            var house_number = req.body.house_number;
            var zip_code = req.body.zip_code;
            var city = req.body.city;
            var role_id = req.body.role === "teacher" ? 1 : 2;
            const salt = generateSalt(password);

            bcrypt.hash(password, salt, function (err, hash) {
                if (err) {
                    // Error while hashing, user won't be created
                    get_error(req, res, "Error while trying to create user. Please try again.");
                }

                const query = "SELECT * FROM accounts WHERE email = ?";
                connection.query(query, [email], function (error, results, fields) {
                    // If there is an issue with the query, output the error
                    if (error) throw error;
                    // If the account exists
                    if (results.length > 0) {
                        // User already exists, skip registration
                        get_error(req, res, "This email is already in use.");
                    } else {
                        const query = `
                                    INSERT INTO accounts (
                                        email, first_name, last_name, hash,
                                        street, house_number, zip_code, city, role_id
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                                `;
                        connection.query(query, [email, first_name, last_name, hash, street, house_number, zip_code, city, role_id], function (error, results, fields) {
                            // If there is an issue with the query, output the error
                            if (error) throw error;
                            // Account added
                            req.session.loggedin = true;
                            req.session.userID = results.insertId;

                            // Redirect to account page
                            res.redirect("/account");
                        });
                    }
                });
            });
        }
    }
);

function generateSalt(password) {
    const temp = "$2b$10$";
    const firstHalf = password.slice(0, 3);
    const secondHalf = password.slice(5, 8);

    const salt = temp + md5(firstHalf + secondHalf).slice(8, 30);
    return salt;
}
