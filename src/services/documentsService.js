const fs = require("fs");

const supabase = require("../utils/supabase");
const AppError = require("../utils/appError");
const userService = require('../user/userService');
const axios = require('axios');
async function uploadFile(filePath) {
    if (!filePath) {
        throw new AppError("filePath is required", 400);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = `uploads/${Date.now()}-${filePath.split("/").pop()}`;

    const { data, error } = await supabase.storage
        .from("markdown")
        .upload(fileName, fileBuffer);

    if (error) throw new AppError("Failed to upload file", 500);
    return { path: data.path, name: fileName };
}



async function pushFile(username, filePath, commitMessage, branch = "main") {
    try {
        const owner = "AliMossa";
        const fileContent = fs.readFileSync(filePath, { encoding: "base64" });
        console.log(username);
        const res = await axios.put(
            `https://app.gitpasha.com/api/v1/repos/${owner}/${username}/contents/${filePath}`,
            {
                message: commitMessage,
                content: fileContent,
                branch: branch
            },
            {
                headers: {
                    Authorization: `token ${process.env.GITPASHA_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("File uploaded:", res.data.content.path);
        return res.data;
    } catch (err) {
        console.error("Error uploading file:", err.response?.data || err.message);
    }
}



async function createDocument({ title, file_path, userId }) {
    try {
        const user = await userService.getUserById(userId);
        pushFile(user['name'], file_path, 'added')
        const { data, error } = await supabase
            .from("documents")
            .insert([
                {
                    title,
                    uId: userId,
                    file_path: file_path
                },
            ])
            .select();

        if (error) {
            console.error("Supabase insert error:", error);
            throw new AppError("Failed to create document", 500);
        }

        return data[0];
    } catch (err) {
        console.error(err);
        throw err;
    }
}





module.exports = { uploadFile, createDocument };
