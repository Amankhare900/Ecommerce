const express = require("express");
const session = require("express-session");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const sendMail = require("./methods/emails.js");
// const exp = require("constants");
const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/public/Home"));
app.use(express.static(__dirname + "/public/Login"));
app.use(express.json());

app.route("/getProduct").post((req, res) => {
  let index = req.body.productShown;
  console.log(index);
  console.log(req.body);
  if (req.session.is_Logged_in) {
    fs.readFile("./data.json", "utf-8", (err, data) => {
      if (err) {
        console.log(err);
      }
      products = JSON.parse(data).products;
      let arr = [];
      for (let i = index; i < index + 5; i++) {
        if (i < products.length) {
          arr.push(products[i]);
        } else {
          break;
        }
      }
      res.send(arr);
    });
  } else {
    res.redirect("/login");
  }
});
app.route("/product").get((req, res) => {
  if (req.session.is_Logged_in) {
    res.render(__dirname + "/public/home/views/product/product.ejs", {
      username: req.session.username,
    });
  } else {
    res.redirect("/login");
  }
});
app.route("/").get((req, res) => {
  if (req.session.is_Logged_in) {
    res.redirect("/product");
  } else {
    res.sendFile(__dirname + "/public/home/home.html");
  }
});
app.use(cookieParser());

app
  .route("/login")
  .get((req, res) => {
    if (req.session.is_Logged_in) {
      res.redirect("/");
    } else {
      if (req.cookies.error) {
        let error = req.cookies["error"];
        res.clearCookie("error", { httpOnly: true });
        res.render(__dirname + "/public/Login/login.ejs", {
          error: error,
        });
      } else {
        res.render(__dirname + "/public/Login/login.ejs", {
          error: "",
        });
      }
    }
  })
  .post((req, res) => {
    fs.readFile("./db.txt", "utf-8", (err, data) => {
      let obj;
      if (data.length === 0) {
        res.cookie("error", "user not exist", {
          httpOnly: true,
        });
        res.redirect("/signup");
      } else {
        obj = JSON.parse(data);
        if (req.body.email.trim() !== "" && req.body.password.trim() !== "") {
          if (obj[req.body.email.trim()]) {
            if (obj[req.body.email.trim()].isVerified) {
              if (
                obj[req.body.email.trim()].password === req.body.password.trim()
              ) {
                req.session.is_Logged_in = true;
                req.session.username = obj[req.body.email.trim()].username;
                res.redirect("/");
              } else {
                //sending data back to to the server
                res.cookie("error", "Wrong Username or Password", {
                  httpOnly: true,
                });
                res.redirect("/login");
              }
            } else {
              res.cookie("error", "User not Verified", {
                httpOnly: true,
              });
              res.redirect("/login");
            }
          } else {
            res.cookie("error", "Wrong Email or Password", {
              httpOnly: true,
            });
            res.redirect("/login");
          }
        } else {
          res.cookie("error", "fill All the Credential", { httpOnly: true });
          res.redirect("/login");
        }
      }
    });
  });

app
  .route("/reset")
  .get((req, res) => {
    if (req.cookies.isResetVerified) {
      res.clearCookie("isResetVerified", { httpOnly: true });
      res.render(__dirname + "/public/Login/reset.ejs", {
        isVerified: true,
        error: "",
      });
    } else {
      res.render(__dirname + "/public/Login/reset.ejs", {
        isVerified: false,
        error: "",
      });
    }
  })
  .post((req, res) => {
    fs.readFile("./db.txt", "utf-8", (err, data) => {
      if (err) {
        console.log(err);
      }
      let obj = JSON.parse(data);
      if (req.body.email.trim() !== "") {
        if (obj[req.body.email.trim()]) {
          if (obj[req.body.email.trim()].isVerified) {
            if (!obj[req.body.email.trim()].isResetVerified) {
              console.log("Resetting Password sending Mail");
              let otp = Math.floor(Math.random() * 1000000);
              obj[req.body.email.trim()].otp = otp;
              obj[req.body.email.trim()].isResetVerified = false;
              fs.writeFile("./db.txt", JSON.stringify(obj), (err) => {
                if (err) {
                  console.log(err);
                }
                sendMail(req.body.email.trim(), "Reset Password", true, otp);
                res.render(__dirname + "/public/Login/reset.ejs", {
                  isVerified: false,
                  error: "Verify You mail",
                });
              });
            } else {
              if (req.body.confirmPassword === req.body.password) {
                console.log("Resetting Password, password matched");
                obj[req.body.email.trim()].password = req.body.password;
                obj[req.body.email.trim()].isResetVerified = false;
                fs.writeFile("./db.txt", JSON.stringify(obj), (err) => {
                  if (err) {
                    console.log(err);
                  }
                  res.redirect("/login");
                });
              } else {
                res.render(__dirname + "/public/Login/reset.ejs", {
                  isVerified: true,
                  error: "Password not Matched",
                });
              }
            }
          } else {
            res.render(__dirname + "/public/Login/reset.ejs", {
              isVerified: false,
              error: "User not Verified go verify your email",
            });
          }
        } else {
          res.render(__dirname + "/public/Login/reset.ejs", {
            isVerified: false,
            error: "User not Exist",
          });
        }
      } else {
        res.render(__dirname + "/public/Login/reset.ejs", {
          isVerified: false,
          error: "Fill the Credential",
        });
      }
    });
  });

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});
app
  .route("/signup")
  .get((req, res) => {
    if (req.session.is_Logged_in) {
      res.redirect("/");
    } else {
      if (req.cookies.error) {
        let error = req.cookies["error"];
        res.clearCookie("error", { httpOnly: true });
        res.render(__dirname + "/public/SignUp/signup.ejs", {
          error: error,
        });
      } else {
        res.render(__dirname + "/public/SignUp/signup.ejs", {
          error: "",
        });
      }
    }
  })
  .post((req, res) => {
    fs.readFile("./db.txt", "utf-8", (err, data) => {
      let obj;
      if (data.length === 0) {
        obj = {};
      } else {
        obj = JSON.parse(data);
      }
      if (
        req.body.username.trim() !== "" &&
        req.body.password.trim() !== "" &&
        req.body.email.trim() !== "" &&
        req.body.address.trim() !== "" &&
        req.body.number.trim() !== ""
      ) {
        if (obj[req.body.email.trim()]) {
          res.cookie("error", "User Already Exist", { httpOnly: true });
          res.redirect("/signup");
        } else {
          let email = req.body.email.trim();
          let username = req.body.username.trim();
          let address = req.body.address.trim();
          let password = req.body.password.trim();
          let number = req.body.number.trim();

          let emails = Object.keys(obj);
          let isExist = false;
          emails.forEach((e) => {
            if (obj[e].username === username || obj[e].number === number) {
              isExist = true;
            }
          });
          if (!isExist) {
            let token = Math.floor(Math.random() * 1000);
            obj[email] = {};
            obj[email].number = number;
            obj[email].username = username;
            obj[email].password = password;
            obj[email].address = address;
            obj[email].token = token;
            obj[email].isVerified = false;
            obj[email].isResetVerified = false;

            fs.writeFile("./db.txt", JSON.stringify(obj), (err) => {
              if (err) {
                console.log(err);
              } else {
                res.cookie(
                  "error",
                  "your Account have been Created verify your Email",
                  { httpOnly: true }
                );
                res.redirect("/signup");

                sendMail(email, "verify you account", false, token);
                console.log("data added successfully");
              }
            });
          } else {
            res.cookie("error", "User Already Exist", { httpOnly: true });
            res.redirect("/signup");
          }
        }
      } else {
        res.cookie("error", "fill All the Credential", { httpOnly: true });
        res.redirect("/signup");
      }
    });
  });

app.get("/verify", (req, res) => {
  let code = req.query.token;
  let email = req.query.email;
  let toReset = JSON.parse(req.query.toReset);
  fs.readFile("./db.txt", "utf-8", (err, data) => {
    let obj;
    if (data.length === 0) {
      obj = {};
    } else {
      obj = JSON.parse(data);
    }
    console.log(code);
    console.log(toReset);
    console.log("inside verify");
    if (!toReset) {
      console.log("insider the verifying mail");
      if (obj[email].token == code) {
        console.log("insider the verifying mail");
        fs.writeFile("./db.txt", JSON.stringify(obj), () => {
          res.redirect("/login");
        });
      } else {
        res.send("invalid code");
      }
    } else {
      if (obj[email].otp == code) {
        fs.writeFile("./db.txt", JSON.stringify(obj), () => {
          console.log("verified Resetting Password");

          res.cookie("isResetVerified", true, { httpOnly: true });
          res.redirect("/reset");
        });
      } else {
        res.send("invalid code");
      }
    }
  });
});
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});

// let signingIn = (obj) => {};
