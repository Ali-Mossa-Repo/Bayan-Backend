const gitService = require('../services/gitService');

const AppError = require('../utils/appError');


exports.createDocument = async (req, res, next) => {
    try {
        const { title, file_path } = req.body;
        console.log('Request body:', req.body);

        if (!title || !file_path) {
            return next(new AppError('Title and markdown file are required', 400));
        }
        const userId = req.user.id

        const newDocument = await documentService.createDocument({ title, file_path, userId });

        res.status(201).json({
            status: 'success',
            data: newDocument
        });
    } catch (err) {
        next(err);
    }
};