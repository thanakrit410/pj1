const   express = require('express'),
        router  = express.Router(),
        User    = require('../models/user'),
		Comment = require('../models/comment'),
        passport= require('passport'),
		multer = require('multer'),
        path = require('path'),
        storage = multer.diskStorage({
                destination: function(req, file, callback){
                    callback(null,'./public/upload/');

                },
                filename: function(req, file, callback){
                    callback(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname));
                }

        }),
        imageFilter = function(req, file, callback){
            if(!file.originalname.match(/\.(jpg|jpng|png|gif)$/i)){
                return callback(new Error('Only jpg,jpng,png and gif.'),false);
            }
            callback(null, true);
        },
        upload = multer({storage: storage, fileFilter: imageFilter});





router.get ( "/", function ( req, res ){
    res.render ( "index2.ejs" );		
});

router.get ( "/login", function ( req, res ){
	res.render ( "showmovie/login.ejs" );		
});
router.get ( "/register", function ( req, res ){
	res.render ( "showmovie/register.ejs" );		
});

router.post('/register', upload.single('profileImage'), function(req, res){
	req.body.profileImage = '/upload/'+req.file.filename;
	
	let newUser = new User({username: req.body.username,
							Name: req.body.Name,
							email: req.body.email,
							profileImage: req.body.profileImage
	});
	if(req.body.adminCode === 'topsecret'){
        newUser.isAdmin = true;
    }  
	User.register(newUser, req.body.password, function(err, user){
		if(err)
		{
			req.flash('error', err.message);
            return res.redirect('/register');
			

		}
		else
		{
			passport.authenticate('local')(req, res, function(){
			req.flash('success', user.username +', Welcome to APmovie');
			res.render("index2.ejs");;
			});
		}
	});
});

router.post('/login',passport.authenticate('local',
	{
		successRedirect: '/showmovie',
		failureRedirect: '/login',
		successFlash: true,
        failureFlash: true,
        successFlash: 'Successfully login',
        failureFlash: 'Invalid username or password'
	}), function(req,res){


});

router.get('/logout', function(req,res){
	req.logOut();
	req.flash('success', 'Log you out successfully');
	res.redirect('/');
});

router.get('/user/:id', function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash('error', 'There is something wrong!');
            return res.redirect('/');
        } else {
			Comment.find().where('author.id').equals(foundUser._id).exec(function(err, foundComment){
				if(err){
				 req.flash('error', 'There is something wrong!');
				 return res.redirect('/');
				} else {
				 res.render('User/profile.ejs',{ user: foundUser,Comment:foundComment});
				}   
			 });
                  
            
        }
    });
});

module.exports = router;