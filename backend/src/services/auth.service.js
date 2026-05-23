const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

class AuthService {
  async register({ name, email, password, phone }) {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError) throw new AppError('Erro ao verificar usuário existente', 500);
    if (existingUser) throw new AppError('E-mail já cadastrado', 409);

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ name, email, password_hash, phone, role: 'CUSTOMER' }])
      .select('id, name, email, role')
      .single();

    if (insertError) throw new AppError('Erro ao criar usuário', 500);

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, name: newUser.name, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { user: newUser, token };
  }

  async login({ email, password }) {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, role, password_hash')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) throw new AppError('Erro ao buscar usuário', 500);
    if (!user) throw new AppError('Credenciais inválidas', 401);

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) throw new AppError('Credenciais inválidas', 401);

    const { password_hash, ...userWithoutPassword } = user;

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { user: userWithoutPassword, token };
  }
}

module.exports = new AuthService();
