//====================================================
// IMPORTS
//====================================================
// NPM imports
const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const expressSession = require("express-session");
const flash = require('connect-flash');

// Config import
let config;
try{
	config = require("./config");
} catch(e){
	console.log("Could not import 'config.js'. Maybe NOT working locally?");
	console.log(e);
}

// Route Imports
const placesRoutes = require("./routes/places");
const mainRoutes = require("./routes/main");
const commentsRoutes = require("./routes/comments");
const authRoutes = require("./routes/auth");

//====================================================
// DEVELOPMENT
//====================================================
// DB Seeding
// const DbSeed = require("./utils/DbSeed");
// DbSeed();

//====================================================
// CONFIG
//====================================================
// DB settings, Connection
try{
	mongoose.connect(config.db.connection, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});	
} catch(err){
	mongoose.connect(process.env.DB_CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
}

// Model Imports
const Place = require("./models/place");
const Comment = require("./models/comment");
const User = require("./models/user");

// Express Config
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true})); 
app.use(methodOverride('_method')) // override with POST having ?_method=DELETE

// Express Session Config
app.use(expressSession({
	secret: process.env.ES_SECRET || config.expressSession.secret,
	resave: false,
	saveUninitialized: false
}));

// Connect-Flash
app.use(flash());

// Passpor Config
app.use(passport.initialize());
app.use(passport.session()); //Allows persistent sessions
passport.serializeUser(User.serializeUser()); //What data should be stored in session
passport.deserializeUser(User.deserializeUser()); //Get the user data from stored session
passport.use(new LocalStrategy(User.authenticate())); //Use the local strategy

// Current User Middleware Config. Passing user to every route
app.use((req, res, next)=>{
	res.locals.user = req.user;
	next();
})

// Use Routes
app.use("/", mainRoutes);
app.use("/", authRoutes);
app.use("/places", placesRoutes);
app.use("/places/:id/comments", commentsRoutes);

//====================================================
// LISTEN
//====================================================
app.listen(process.env.PORT || 3000, ()=> {
	console.log("BAires is running...");
});

// Killing rogue process:
// sudo netstat -ltnp | grep -w ":3000"
// kill {numero que aparezca}