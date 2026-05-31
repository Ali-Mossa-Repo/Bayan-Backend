const gitService = require('../services/gitService');
const AppError = require('../utils/appError');
const axios = require("axios");


exports.getCommits = async (req, res, next) => {
    try {
        const { owner, repo } = req.body;
        const commits = await gitService.listCommits(owner, repo, 200);
        const grouped = gitService.groupByTree(commits);
        res.status(200).json({
            status: 'success',
            data: grouped
        });
    } catch (err) {
        next(err);
    }
};

// exports.restoreCommit = async (req, res, next) => {
//     try {
//         const { owner, repo, commitSha, branchName } = req.body || {};

//         if (!commitSha || !branchName) {
//             return next(new AppError('commitSha and branchName are required', 400));
//         }

//         //await gitService.createBranch(OWNER, REPO, `backup-${Date.now()}`, commitSha);
//         await gitService.downloadCommitZip(owner, repo, branchName, commitSha);

//         res.status(200).json({
//             status: 'success',
//             message: `Branch ${branchName} restored to ${commitSha}`
//         });
//     } catch (err) {
//         next(err);
//     }
// };



exports.cloneAtCommit = async (req, res, next) => {
    try {
        const { filePath, repoUrl, commitSha } = req.body;
        console.log(repoUrl)
        if (!repoUrl || !commitSha) {
            return next(new AppError('repoUrl and commitSha are required', 400));
        }
        const result = await gitService.cloneAtCommitAsJson(filePath, repoUrl, commitSha);
        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (err) {
        next(err);
    }
};
