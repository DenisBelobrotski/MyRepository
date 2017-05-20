const express = require('express');

const bodyParser = require('body-parser');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();

const mongodb = require('./db');

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
}, (username, password, done) => {
    mongodb.getUserByName(username).then((user) => {
        if (!user || user.password !== password) {
            done(null, false);
        } else {
            done(null, user);
        }
    }).catch((err) => {
        console.log(err);
    });
}));

passport.serializeUser((user, done) => done(null, user.login));

passport.deserializeUser((username, done) => {
    mongodb.getUserByName(username).then((user) => {
        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    }).catch((err) => {
        console.log(err);
    })
});

app.set('port', (process.env.PORT || 8841));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

app.get('/user', (req, res) => {
    mongodb.getUsers().then((result) => {
        res.json(result.sort((a, b) => a.login.toLowerCase().localeCompare(b.login.toLowerCase())));
    }).catch((err) => {
        console.log(err);
    });
});

app.get('/article', (req, res) => {
    mongodb.getArticles().then((result) => {
        res.json(result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }).catch((err) => {
        console.log(err);
    });
});

app.get('/article/:id', (req, res) => {
    console.log(req.query.id);
    mongodb.getArticleById(req.query.id).then((article) => {
        res.json(article)
    }).catch((err) => {
        console.log(err);
    });
});

app.get('/tags', (req, res) => {
    mongodb.getTags().then((result) => {
        res.json((result.map((value) => value.tag)).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())));
    }).catch((err) => {
        console.log(err);
    });
});

app.get('/incorrect-login', (req, res) => res.json(null));

app.post('/article', (req, res) => {
    mongodb.addArticle(req.body).then((result) => {
        res.json(result);
    }).catch((err) => {
        console.log(err);
    });
});

app.post('/tag', (req, res) => {
    mongodb.getTags().then((result) => {
        let findTag = req.body.tag;
        let tags = result.map((value) => value.tag);
        if (tags.indexOf(findTag) === -1) {
            mongodb.addTag(req.body).then((result) => {
                res.json(result);
            }).catch((err) => {
                console.log(err);
            });
        } else {
            mongodb.findTag(req.body).then((result) => {
                res.json(result);
            }).catch((err) => {
                console.log(err);
            })
        }
    }).catch((err) => {
        console.log(err);
    });
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/incorrect-login' }), (req, res) => res.json(req.user.login));

app.put('/article', (req, res) => {
    mongodb.changeArticleById(req.body._id, req.body).then((result) => {
        res.json(result);
    }).catch((err) => {
        console.log(err);
    });
});

app.delete('/article', (req, res) => {
    mongodb.getArticleById(req.body.id).then((article) => {
        article.isHidden = true;
        mongodb.changeArticleById(req.body.id, article).then((result) => {
            res.json(result);
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    });
});

const url = 'mongodb://localhost:27017/localdb';

mongodb.connect(url, (err) => {
    if (err) {
        console.log(err);
    } else {
        app.listen(app.get('port'), () => {
            console.log('Server running on port: ', app.get('port'));
        });
    }
});

