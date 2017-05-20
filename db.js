const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;

let mongodb;

const ArticleSchema = mongoose.Schema({
    title: String,
    summary: String,
    createdAt: Date,
    author: String,
    tags: Array,
    content: String,
    isHidden: Boolean,
});
const TagSchema = mongoose.Schema({
    tag: String,
});
const UserSchema = mongoose.Schema({
    login: String,
    password: String,
});

const Articles = mongoose.model('articles', ArticleSchema);
const Tags = mongoose.model('tags', TagSchema);
const Users = mongoose.model('users', UserSchema);

function connect(url, run) {
    mongoose.connect(url);
    mongodb = mongoose.connection;
    mongodb.on('error', () => console.log('error'));
    mongodb.once('open', () => {
        console.log('Connected to database');
        run();
    });
}

function getArticles() {
    return Articles.find();
}

function getUsers() {
    return Users.find();
}

function getTags() {
    return Tags.find();
}

function getUserByName(name) {
    return Users.findOne({ login: name });
}

function getArticleById(id) {
    return Articles.findOne({ _id: new ObjectID(id) });
}

function addArticle(article) {
    return Articles.create(article);
}

function addTag(tag) {
    return Tags.create(tag);
}

function addUser(user) {
    return Users.create(user);
}

function findTag(tag) {
    return Tags.findOne(tag);
}

function changeArticleById(id, article) {
    const tmpId = new ObjectID(id);
    article._id = tmpId;
    return Articles.update({ _id: tmpId }, article);
}

module.exports = {
    connect,
    getArticles,
    getUsers,
    getTags,
    getUserByName,
    getArticleById,
    addArticle,
    addTag,
    findTag,
    addUser,
    changeArticleById,
    ObjectID
};

