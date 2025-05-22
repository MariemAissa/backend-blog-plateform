const axios = require('axios');

const { createClient } = require('redis');

const redisClient = createClient();
redisClient.connect();

const Article = require('../models/article.model');

exports.createArticle = async (req, res) => {
    try {
        const { title, content, image, tags } = req.body;
        const author = req.user.id;
        const article = new Article({ title, content, image, tags, author });
        await article.save();
        res.status(201).json(article);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find().populate('author', 'username email');
        res.json(articles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate('author', 'username email');
        if (!article) return res.status(404).json({ message: 'Article not found' });
        res.json(article);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: 'Article not found' });

        const isOwner = article.author.toString() === req.user.id;
        const isEditorOrAdmin = ['admin', 'editor'].includes(req.user.role);

        if (!isOwner && !isEditorOrAdmin) return res.status(403).json({ message: 'Forbidden' });

        Object.assign(article, req.body);
        await article.save();

        res.json(article);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteArticle = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only admins can delete articles' });

        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: 'Article not found' });

        await article.remove();
        res.json({ message: 'Article deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.addComment = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // save comment to DB (assume using Mongoose)
    const article = await Article.findById(id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    const comment = {
        content,
        user: userId,
        createdAt: new Date()
    };

    article.comments.push(comment);
    await article.save();

    // 🔴 Publish the event to Redis
    await redisClient.publish('comment:created', JSON.stringify({
        articleId: article._id,
        authorId: article.author,
        commenterId: userId,
        commentContent: content,
    }));

    res.status(201).json({ message: 'Comment added', comment });
};



// exports.addComment = async (req, res) => {
//     try {
//         const { text } = req.body;
//         const article = await Article.findById(req.params.id);
//         if (!article) return res.status(404).json({ message: "Article not found" });
//
//         const comment = { userId: req.user.id, text, createdAt: new Date() };
//         article.comments.push(comment);
//         await article.save();
//
//         // Notify the article author
//         await axios.post("http://localhost:6000/notify", {
//             userId: article.authorId,
//             message: `New comment on your article "${article.title}"`
//         });
//
//         res.json(article);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };
