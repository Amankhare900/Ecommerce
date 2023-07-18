const express = require("express");
const session = require("express-session");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const sendMail = require("./methods/emails.js");
const mysql = require("mysql2");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "<write your mySql Password>",
  database: "<write the database name here>",
});
connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("connected");
  }
});
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
app.use(express.static("uploads"));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/public/Home"));
app.use(express.static(__dirname + "/public/Login"));
app.use(express.static(__dirname + "/public/Admin"));
app.use(express.json());

app.route("/getProduct").post((req, res) => {
  let index = req.body.productShown;
  let myCartProduct;

  let readQuery = `select * from products limit 5 offset ${index}`;
  connection.query(readQuery, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      products = data;
      // console.log(data);
      if (req.session.is_Logged_in) {
        let getQuery = `select distinct(product_id) from cart_items where user_id="${req.session.username}"`;
        connection.query(getQuery, (err, data) => {
          if (err) {
            console.log(err);
          } else {
            myCartProduct = data;
            res.send({ products, myCartProduct });
          }
        });
      } else {
        res.send({ products });
      }
    }
  });
});
app.route("/product").get((req, res) => {
  if (req.session.is_Logged_in) {
    res.render(__dirname + "/public/home/views/product/product.ejs", {
      username: req.session.username,
      isLoggedIn: "T",
      isAdmin: "",
      // cart: data,
    });
  } else {
    res.render(__dirname + "/public/home/views/product/product.ejs", {
      username: "",
      isLoggedIn: "",
      isAdmin: "",
    });
  }
  // } else {
  // res.redirect("/login");
  // }
});

app.route("/editProduct").post((req, res) => {
  let { id } = req.body;
  let selectQuery = `select * from products where id = ${id}`;
  connection.query(selectQuery, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      // console.log("Data fetched from /editProduct:", data);
      res.cookie("data", JSON.stringify(data), { httpOnly: true });
      // console.log("Redirecting to /admin...");
      // res.redirect("/admin");
      res.end();
    }
  });
});

app.route("/updateProduct").post(upload.single("image"), (req, res) => {
  console.log(req.body);
  let { name, price, category, description, quantity } = req.body;

  let { id } = req.query;
  let updateQuery = `update products set title = '${name}',category='${category}', price = ${price},images='${req.file.filename}', description = "${description}", stock = ${quantity} where id = ${id}`;
  connection.query(updateQuery, (err, data) => {
    if (err) {
      console.log(err);
      res.end("error");
    } else {
      // console.log("Data updated in /updateProduct:", data);
      res.redirect("/dashboard");
    }
  });
});

app
  .route("/cart")
  .get((req, res) => {
    if (req.session.is_Logged_in) {
      res.render(__dirname + "/public/home/views/cart/cart.ejs", {
        username: req.session.username,
        isLoggedIn: "T",
        isAdmin: "",
      });
    } else {
      res.redirect("/login");
    }
  })
  .post((req, res) => {
    let selectQuery = `SELECT *  FROM products p INNER JOIN cart_items c ON p.id = c.product_id where c.user_id ='${req.session.username}';`;
    connection.query(selectQuery, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.send(data);
      }
    });
  });
app.route("/decreaseQ").post((req, res) => {
  let { id } = req.body;

  let updateQuery = `update cart_items set quantity = quantity-1 where product_id = ${id} and user_id = '${req.session.username}'`;
  connection.query(updateQuery, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      res.send(data);
    }
  });
});
app.route("/increaseQ").post((req, res) => {
  let { id } = req.body;
  let updateQuery = `update cart_items set quantity = quantity+1 where product_id = ${id} and user_id = '${req.session.username}'`;
  connection.query(updateQuery, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      res.send(data);
    }
  });
});

app.post("/removeProduct", (req, res) => {
  let { id } = req.body;
  let selectQuery = `select images from products where id = ${id}`;
  connection.query(selectQuery, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      let images = data[0].images;
      fs.unlinkSync(__dirname + "/uploads/" + images);
      let deleteQuery = `delete from products where id = ${id}`;
      connection.query(deleteQuery, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.send(data);
        }
      });
    }
  });
});

app
  .route("/dashboard")
  .get((req, res) => {
    if (req.session.is_Logged_in) {
      let searchQuery = `select isAdmin from users where username='${req.session.username}'`;
      connection.query(searchQuery, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          if (data[0].isAdmin == 1) {
            res.render(__dirname + "/public/Admin/dashboard.ejs", {
              username: req.session.username,
              isLoggedIn: "T",
              isAdmin: "T",
            });
          } else {
            res.redirect("/");
          }
        }
      });
    } else {
      res.redirect("/login");
    }
  })
  .post((req, res) => {
    let { id } = req.body;
    let deleteQuery = `delete from products where id = ${id}`;
    connection.query(deleteQuery, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        res.send(data);
      }
    });
  });
app.route("/removeFromCart").post((req, res) => {
  let { id } = req.body;
  let deleteQuery = `delete from cart_items where product_id = ${id} and user_id = '${req.session.username}'`;
  connection.query(deleteQuery, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      res.send(data);
    }
  });
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
          username: "",
          isAdmin: "",
          isLoggedIn: "",
          error: error,
        });
      } else {
        console.log("hello");
        res.render(__dirname + "/public/Login/login.ejs", {
          username: "",
          isAdmin: "",
          isLoggedIn: "",
          error: "",
        });
      }
    }
  })
  .post((req, res) => {
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();
    let readQuery = `select * from users where email='${email}'`;
    connection.query(readQuery, (err, data) => {
      let obj;
      if (data.length === 0) {
        res.cookie("error", "Wrong Email", {
          httpOnly: true,
        });
        res.redirect("/login");
      } else {
        obj = data;
        if (email !== "" && password !== "") {
          if (obj[0].isVerified) {
            if (obj[0].password === password) {
              req.session.is_Logged_in = true;
              req.session.username = obj[0].username;
              if (obj[0].isadmin == 1) {
                res.redirect("/admin");
              } else {
                res.redirect("/");
              }
            } else {
              //sending data back to to the server
              res.cookie("error", "Wrong Password", {
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
          res.cookie("error", "fill All the Credential", { httpOnly: true });
          res.redirect("/login");
        }
      }
    });
  });
app
  .route("/admin")
  .get((req, res) => {
    if (req.session.is_Logged_in) {
      let searchQuery = `select isAdmin from users where username='${req.session.username}'`;
      connection.query(searchQuery, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          if (data[0].isAdmin == 1) {
            if (req.cookies.error) {
              let error = req.cookies["error"];
              res.clearCookie("error", { httpOnly: true });
              console.log("Rendering admin page with error:", error);
              res.render(__dirname + "/public/Admin/admin.ejs", {
                username: req.session.username,
                isLoggedIn: "T",
                isAdmin: "T",
                data: "",
                error: error,
              });
            } else {
              if (req.cookies.data) {
                console.log(
                  "Rendering admin page with data:",
                  req.cookies.data
                );
                let data = JSON.parse(req.cookies["data"]);
                res.clearCookie("data", { httpOnly: true });
                res.render(__dirname + "/public/Admin/admin.ejs", {
                  username: req.session.username,
                  isLoggedIn: "T",
                  isAdmin: "T",
                  data: data,
                  error: "",
                });
              } else {
                console.log("Rendering admin page without data or error.");
                res.render(__dirname + "/public/Admin/admin.ejs", {
                  username: req.session.username,
                  isLoggedIn: "T",
                  isAdmin: "T",
                  data: "",
                  error: "",
                });
              }
            }
          } else {
            res.redirect("/");
          }
        }
      });
    } else {
      res.redirect("/login");
    }
  })
  .post(upload.single("image"), (req, res) => {
    let { name, price, description, category, quantity } = req.body;
    if (name && price && description && category && quantity) {
      name = name.trim();
      price = price.trim();
      description = description.trim();
      category = category.trim();
      quantity = quantity.trim();
      if (
        name !== "" &&
        price !== "" &&
        description !== "" &&
        category !== "" &&
        quantity !== ""
      ) {
        let insertQuery = `insert into products (title,price,description,images,category,stock) values ('${name}','${price}','${description}','${req.file.filename}','${category}',${quantity})`;
        connection.query(insertQuery, (err, data) => {
          if (err) {
            console.log(err);
          } else {
            console.log(data);
            res.cookie("error", "Product Added", {
              httpOnly: true,
            });
            res.redirect("/admin");
          }
        });
      } else {
        res.cookie("error", "fill all the details", {
          httpOnly: true,
        });
        res.redirect("/admin");
      }
    }
  });
app.route("/addToCart").post((req, res) => {
  console.log(req.session.is_Logged_in);
  if (req.session.is_Logged_in) {
    let { productId } = req.body;
    let username = req.session.username;
    console.log(productId, " ", username);
    // let insertQuery = `insert into cart (customer_id) values (${req.session.username})`;

    let insertQuery = `insert into cart_items (product_id,quantity, user_id) values (${productId},1,'${username}')`;
    connection.query(insertQuery, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        res.send("success");
      }
    });
  } else {
    res.end();
  }
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
    let { email } = req.body;
    let readQuery = "";
    readQuery = email
      ? `select * from users where email='${req.body.email}';`
      : `select * from users where otp='${req.body.otp}';`;
    connection.query(readQuery, (err, data) => {
      if (data.length === 0) {
        email
          ? res.render(__dirname + "/public/Login/reset.ejs", {
              isVerified: false,
              error: "User not Exist",
            })
          : res.render(__dirname + "/public/Login/reset.ejs", {
              isVerified: true,
              error: "Wrong OTP",
            });
      } else {
        // console.log(obj);
        if (email) {
          if (email !== "") {
            if (data[0].isVerified) {
              //   if (data[0].isResetVerified != 1) {
              console.log("Resetting Password sending Mail");
              let otp = otpGenerator();

              let updateSql = `UPDATE users SET isResetVerified = 0, otp = ${otp} where email='${email}';`;
              connection.query(updateSql, (err, data) => {
                if (err) {
                  console.log(err);
                } else {
                  sendMail(email, "Reset Password", 1, otp);
                  res.render(__dirname + "/public/Login/reset.ejs", {
                    isVerified: false,
                    error: "Verify You mail",
                  });
                }
              });
            } else {
              res.render(__dirname + "/public/Login/reset.ejs", {
                isVerified: false,
                error: "User not Verified go verify your email",
              });
            }
          } else {
            res.render(__dirname + "/public/Login/reset.ejs", {
              isVerified: false,
              error: "Fill the Credential",
            });
          }
        } else {
          if (data[0].isResetVerified === 1) {
            if (parseInt(req.body.otp) === data[0].otp) {
              if (req.body.confirmPassword === req.body.password) {
                let password = req.body.password.trim();
                console.log("Resetting Password, password matched");
                let updateSql = `UPDATE users SET isResetVerified = 0, password=${password}, otp=${otpGenerator()} where otp='${
                  data[0].otp
                }';`;
                connection.query(updateSql, (err, data) => {
                  if (err) {
                    console.log(err);
                  } else {
                    res.redirect("/login");
                  }
                });
              } else {
                res.render(__dirname + "/public/Login/reset.ejs", {
                  isVerified: true,
                  error: "Password not Matched",
                });
              }
            } else {
              res.render(__dirname + `/public/Login/reset.ejs`, {
                isVerified: false,
                error: "OTP not Matched",
              });
            }
          }
        }
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
          username: "",
          isAdmin: "",
          isLoggedIn: "",
          error: error,
        });
      } else {
        res.render(__dirname + "/public/SignUp/signup.ejs", {
          username: "",
          isAdmin: "",
          isLoggedIn: "",
          error: "",
        });
      }
    }
  })
  .post((req, res) => {
    let readQuery = "select * from users";
    connection.query(readQuery, (err, data) => {
      let obj;
      if (data.length === 0) {
        obj = {};
        e;
      } else {
        obj = convertToObj(data);
      }

      let { email, username, password, address, number } = req.body;
      email = email.trim();
      username = username.trim();
      password = password.trim();
      address = address.trim();
      number = number.trim();
      if (
        email !== "" &&
        username !== "" &&
        password !== "" &&
        address !== "" &&
        number !== ""
      ) {
        if (obj[email]) {
          res.cookie("error", "User Already Exist", { httpOnly: true });
          res.redirect("/signup");
        } else {
          let emails = Object.keys(obj);
          let isExist = false;
          emails.forEach((e) => {
            if (obj[e].username === username || obj[e].number === number) {
              isExist = true;
            }
          });
          if (!isExist) {
            const passwordRegex =
              /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
            if (!passwordRegex.test(password)) {
              res.cookie(
                "error",
                "Password must contain 8 characters, one uppercase, one lowercase, one number and one special case character",
                { httpOnly: true }
              );
              res.redirect("/signup");
              return;
            } else {
              let token = otpGenerator();
              const insertSql = `INSERT INTO users (email, username, number, address, token, isVerified, isResetVerified, password)
                   VALUES ('${email}', '${username}', '${number}', '${address}', '${token}', 0, 0, '${password}');`;
              connection.query(insertSql, (err, data) => {
                if (err) {
                  console.log(err);
                } else {
                  res.cookie(
                    "error",
                    "your Account have been Created verify your Email",
                    { httpOnly: true }
                  );
                  res.redirect("/signup");

                  sendMail(email, "verify you account", 0, token);
                  console.log("data added successfully");
                }
              });
            }
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

  let readQuery = `select * from users where email = '${email}'`;
  connection.query(readQuery, (err, data) => {
    let obj;
    if (data.length === 0) {
      obj = [];
    } else {
      //   obj = convertToObj(data);
      obj = data;
    }
    console.log("inside verify");
    if (toReset != 1) {
      //   console.log("insider the verifying mail");
      if (obj[0].token == code) {
        console.log("insider the verifying mail");
        // obj[0].isVerified = true;

        let updateSql = `UPDATE users SET isVerified = 1 where email='${email}';`;
        connection.query(updateSql, (err, data) => {
          if (err) {
            console.log(err);
          } else {
            console.log("data updated successfully");
            res.redirect("/login");
          }
        });
      } else {
        res.send("invalid code");
      }
    } else {
      if (obj[0].otp == code) {
        console.log("resetting password");
        let updateSql = `UPDATE users SET isResetVerified = 1 where email='${email}';`;
        connection.query(updateSql, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("data updated successfully");
            res.cookie("isResetVerified", true, { httpOnly: true });
            res.cookie("email", email, { httpOnly: true });
            res.redirect(`/reset`);
          }
        });
      } else {
        res.send("invalid code");
      }
    }
  });
});
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}/product`);
});

function otpGenerator() {
  let otp = Math.floor(Math.random() * 1000000);
  return otp;
}
function convertToObj(arr) {
  let obj = {};
  arr.forEach((data) => {
    obj[data.email] = data;
  });
  return obj;
}
