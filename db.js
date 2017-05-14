const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

let mongodb;

function connect(url, run) {
    if (mongodb) {
        run();
    } else {
        MongoClient.connect(url).then((db) => {
            mongodb = db;
            run();
        }).catch((err) => {
            run(err);
        })
    }
}

function getArticles() {
    return mongodb.collection('articles').find();
}

function getUsers() {
    return mongodb.collection('users').find();
}

function getTags() {
    return mongodb.collection('tags').find();
}

function getUserByName(name) {
    return mongodb.collection('users').findOne({ login: name });
}

function getArticleById(id) {
    return mongodb.collection('articles').findOne({ _id: new ObjectID(id) });
}

function addArticle(article) {
    return mongodb.collection('articles').insertOne(article);
}

function addTag(tag) {
    return mongodb.collection('tags').updateOne(tag, tag, { upsert: true });
}

function changeArticleById(id, article) {
    const tmpId = new ObjectID(id);
    article._id = tmpId;
    return mongodb.collection('articles').updateOne({ _id: tmpId }, article);
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
    changeArticleById,
    ObjectID
};

