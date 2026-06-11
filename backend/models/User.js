import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, default: '' },
  password: {
    type: String,
    required() {
      return !this.googleId;
    },
    minlength: 6,
  },
  avatar: {
    type: String,
    trim: true,
    default: '',
  },
  googleId: { type: String, unique: true, sparse: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || this.$skipPasswordHash) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone || '',
    avatar: this.avatar || '',
    googleId: this.googleId || '',
    authProvider: this.authProvider,
    isVerified: this.isVerified,
    role: this.role,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    hasPassword: Boolean(this.password),
  };
};

export default mongoose.model('User', userSchema);
