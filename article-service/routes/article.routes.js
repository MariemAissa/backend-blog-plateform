const express = require('express');
const router = express.Router();
const articleCtrl = require('../controllers/article.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Public routes
router.get('/all', articleCtrl.getAllArticles);
router.get('/:id', articleCtrl.getArticleById);

// Protected routes
router.post(
    '/create',
    authenticate,
    authorize(['writer', 'editor', 'admin']),
    articleCtrl.createArticle
);

router.put(
    '/:id',
    authenticate,
    authorize(['writer', 'editor', 'admin']),
    articleCtrl.updateArticle
);

router.delete(
    '/:id',
    authenticate,
    authorize(['admin']),
    articleCtrl.deleteArticle
);

router.post(
    '/:id/comments',
    authenticate,
    articleCtrl.addComment
);

module.exports = router;
