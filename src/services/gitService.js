const axios = require('axios');
const fs = require("fs");
const AppError = require('../utils/appError');
const { exec } = require('child_process');
const path = require('path');

const api = axios.create({
    baseURL: process.env.GITPASHA_URL,
    headers: {
        Authorization: `token ${process.env.GITPASHA_ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
    },
});

async function createGitUser(username, email, password) {
    try {
        const response = await api.post('/admin/users', {
            username,
            email,
            password,
            must_change_password: false,
        });
        console.log('User created:', response.data);

        return response.data;
    } catch (err) {
        console.error('Error creating user:', err.response?.data || err.message);
    }
}


async function deleteGitpashaUser(username) {
    try {
        const response = await api.delete(`/admin/users/${username}`);
        console.log(`Gitpasha user "${username}" deleted successfully`);
        return response.data;
    } catch (err) {
        console.error('Error deleting Gitpasha user:', err.response?.data || err.message);
        throw err;
    }
}


async function listCommits(owner, repo, per_page = 100) {
    try {
        const res = await api.get(`/repos/${owner}/${repo}/commits`, {
            params: { per_page }
        });
        return res.data;
    } catch (err) {
        console.error('Error fetching commits:', err.response?.data || err.message);
        throw new AppError('Failed to fetch commits', 500);
    }
}

function groupByTree(commits) {
    const map = {};
    for (const c of commits) {
        const treeSha = c.commit.tree.sha;
        map[treeSha] = map[treeSha] || [];
        map[treeSha].push({
            sha: c.sha,
            message: c.commit.message,
            editBy: c.commit.committer.name
        });
    }
    return map;
}
async function createRepoInMyAccount(repoName) {
    try {
        const response = await api.post(`/user/repos`, {
            name: repoName,
            private: true,
        });
        console.log('Repo created in my account:', response.data);
        return response.data;
    } catch (err) {
        console.error('Error creating repo in my account:', err.response?.data || err.message);
        throw err;
    }
}
async function createBranch(owner, repo, branchName, commitSha) {
    try {
        const res = await api.post(`/repos/${owner}/${repo}/git/refs`, {
            ref: `refs/heads/${branchName}`,
            sha: commitSha
        });
        return res.data;
    } catch (err) {
        console.error('Error creating branch:', err.response?.data || err.message);
        throw new AppError('Failed to create branch', 500);
    }
}

async function forceUpdateBranch(owner, repo, branchName, commitSha) {
    try {
        const res = await api.patch(`/repos/${owner}/${repo}/git/refs/heads/${branchName}`, {
            sha: commitSha,
            force: true
        });
        return res.data;
    } catch (err) {
        console.error('Error force updating branch:', err.response?.data || err.message);
        throw new AppError('Failed to update branch', 500);
    }
}


function runCmd(cmd, options = {}) {
    return new Promise((resolve, reject) => {
        exec(cmd, options, (error, stdout, stderr) => {
            if (error) return reject(stderr || error.message);
            resolve(stdout);
        });
    });
}



// async function readDirRecursive(dir, base = dir) {
//     const entries = await fs.promises.readdir(dir, { withFileTypes: true });
//     const files = {};
//     for (const entry of entries) {
//         const fullPath = path.join(dir, entry.name);
//         if (entry.isDirectory()) {
//             Object.assign(files, await readDirRecursive(fullPath, base));
//         } else {
//             const relPath = path.relative(base, fullPath);
//             const buf = await fs.promises.readFile(fullPath);
//             files[relPath] = buf.toString("base64"); // or "utf8" for text only
//         }
//     }
//     return files;
// }

async function cloneAtCommitAsJson(filePath, repoUrl, commitSha) {
    if (!repoUrl || !commitSha || !filePath) {
        throw new Error("repoUrl, commitSha, and filePath are required");
    }

    const targetDir = path.join(__dirname, `../../tmp/${Date.now()}`);

    await runCmd(`git clone ${repoUrl} ${targetDir}`);
    await runCmd(`git checkout ${commitSha}`, { cwd: targetDir });

    const absPath = path.join(targetDir, filePath);
    const content = await fs.promises.readFile(absPath, "utf8");

    return {
        commit: commitSha,
        path: filePath,
        content,
    };
}






module.exports = {
    cloneAtCommitAsJson,
    listCommits,
    groupByTree,
    createBranch,
    forceUpdateBranch,
    createGitUser,
    deleteGitpashaUser,
    createRepoInMyAccount,

};
