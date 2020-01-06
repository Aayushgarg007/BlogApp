// This file will be long 
// but later we will see that we don't need to have long files
// we can keep configs in different files
// Now for just learning we will keep it in one file

// express-sanitizer is a package used to remove the issue
// that user can run a script tag in the text 
// in which we allow user to write some <p> or similar tag.

var express = require('express');
var app = express();
var bodyParser = require('body-parser'); 
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var expressSanitizer = require('express-sanitizer');

// APP CONFIG
mongoose.connect('mongodb://localhost/blog_app');
app.set("view engine", "ejs");
app.use(express.static("public"));	// for custom stylesheet
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());	// this should be after bodyParser
app.use(methodOverride("_method"));

// Schema for collection
// title
// image
// body - text, blog
// created - date

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
	// this line will set the value to be of type date and with default value of Date.now
	// we can do this for image also, as follows
	// image: {type: String, default: "placeholder.jpg"}
});
var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
// 	title: "Test Blog",
// 	image: "https://www.sciencemag.org/sites/default/files/styles/inline__699w__no_aspect/public/dogs_1280p_0.jpg?itok=_Ch9dkfK",
// 	body: "Hello this is a blog post"
// });

// Blog.create({
// 	title: "Test of Blog data",
// 	image: "https://www.sciencemag.org/sites/default/files/styles/inline__699w__no_aspect/public/dogs_1280p_0.jpg?itok=_Ch9dkfK",
// 	body: "i think this test is awsome"
// });


//RESTFUL ROUTES

app.get("/", function(req, res){
	res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if (err) {
			console.log(err);
		}else{
			res.render("index", {blogs: blogs});
		}
	});
});

// NEW ROUTE
app.get("/blogs/new", function(req,res){
	res.render('new');
});

// CREATE ROUTE
app.post("/blogs", function(req, res){
	// create blog
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, blog){
		if (err) {
			res.render("new");
		}else{
			// then redirect to index
			res.redirect("/blogs");
		}
	});
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if (err) {
			res.redirect("/blogs");
		}else{
			res.render("show", {blog: foundBlog});
		}
	});
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if (err) {
			res.redirect('/blogs');
		}else{
			res.render('edit', {blog: foundBlog});
		}
	});
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	// .findByIdAndUpdate(id, newData, callback)
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if (err) {
			res.redirect('/blogs');
		}else{
			res.redirect('/blogs/'+ req.params.id);
		}
	});
});
// .findByIdAndUpdate(id, newData, callback)
// We cannot send put and delete request using forms. It was not implemented by the creators of html.
// But we can do this using package called 'method-override'. It overrides the request that was made.
// <form action="/blogs/<%= blog._id %>" method="PUT">	// wrong way
// <form action="/blogs/<%= blog._id %>?_method=PUT" method="POST">	// right way
// Here we send regular POST request but has in query string _method="PUT" and method-override will configure it in app.js so that it looks for _method
// if it sees _method="PUT" it will treat it as PUT request.


// DELETE ROUTE
app.delete('/blogs/:id', function(req, res){
	// destroy blog
	// .findByIdAndRemove(id, callback with just err)
	Blog.findByIdAndRemove(req.params.id, function(err){
		if (err) {
			res.redirect('/blogs');
		}else{
			res.redirect('/blogs');
		}
	});

});


app.listen(3000, function(req, res){
	console.log("Server Started on port 3000");
});
