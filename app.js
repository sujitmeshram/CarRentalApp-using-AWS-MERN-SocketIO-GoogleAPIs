//loading modules
const express = require("express");
const exphbs = require("express-handlebars"); //https://www.npmjs.com/package/express-handlebars
const colors = require("colors");

//initialize app
const app = express();

//setup view engine
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//connect cliend side to serve css and js files
app.use(express.static("public"));
//creating port
const port = process.env.PORT || 3000;

// handle home route
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about", {
    title: "About",
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    title: "Contact us",
  });
});

app.get("/signup", (req, res) => {
  res.render("signupForm", {
    title: "Register",
  });
});

app.listen(port, () => {
  console.log(`Server in running on port ${port}`.green);
});
