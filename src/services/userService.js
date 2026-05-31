const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabase');
const AppError = require('../utils/appError');
const gitService = require('./gitService');
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;

function generateAccessToken(user, expiresAt) {
  const token = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: expiresAt },);
  const { exp } = jwt.decode(token);
  return { token, expiresAt: exp };
}


async function createUser(name, email, password) {
  let repo = null;

  try {
    repo = await gitService.createRepoInMyAccount(name);
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          repo_url: repo.html_url,
        },
      ])
      .select();

    if (error) {
      throw new AppError('Failed to create user in Supabase', 500);
    }

    const user = data[0];
    const finalUser = { 'id': user.id, 'name': user.name, 'repo_rul': user.repo_rul };
    const { token, expiresAt } = generateAccessToken(user, '15m');
    const expiresAtReadable = new Date(expiresAt * 1000).toISOString();
    return {
      user: finalUser,
      accessToken: token,
      expiresAtReadable
    };

  } catch (err) {
    console.error("Error creating user:", err);
    if (repo) {
      try {
        await deleteRepoInMyAccount(name);
        console.log("Repo rolled back");
      } catch (rollbackErr) {
        console.error("Failed to rollback repo:", rollbackErr);
      }
    }

    throw new AppError(err);
  }
}

async function getUserByEmail(email) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase select error:', error);
      throw new AppError('Database error', 500);
    }

    return data || null;
  } catch (err) {
    console.error(err);
    throw new AppError('Database error', 500);
  }
}

async function getUserById(id) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase select error:', error);
      throw new AppError('Database error', 500);
    }

    return data || null;
  } catch (err) {
    console.error(err);
    throw new AppError('Database error', 500);
  }
}

async function loginUser(email, password) {
  const user = await getUserByEmail(email);
  if (!user) throw new AppError('Invalid credentials', 401);

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new AppError('Invalid credentials', 401);
  const { token, expiresAt } = generateAccessToken(user, '7d');
  const expiresAtReadable = new Date(expiresAt * 1000).toISOString();

  return {
    token,
    expiresAt: expiresAtReadable
  };
}

async function refreshAccessToken(token) {
  if (!token) throw new AppError('Access token required', 401);

  let decoded;
  try {
    decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    return { accessToken: token };
  } catch (err) {
    console.log(err);
    if (err.name !== 'TokenExpiredError') throw new AppError('Invalid token', 401);
    decoded = jwt.decode(token);
    if (!decoded?.id) throw new AppError('Invalid token payload', 401);
  }

  const user = await getUserById(decoded.id);
  if (!user) throw new AppError('User not found', 404);
  const { accessToken, expiresAt } = generateAccessToken(user, '7d');
  return { accessToken: accessToken, expiresAt };
}



module.exports = {
  createUser,
  loginUser,
  refreshAccessToken,
  getUserByEmail,
  getUserById,
};
