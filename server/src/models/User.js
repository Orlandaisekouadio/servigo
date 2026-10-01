import mongoose from 'mongoose';

export function normalizePhone(raw) {
  if (typeof raw !== 'string') return '';
  return raw.replace(/[\s\-.]/g, '');
}

export function isValidCiPhone(raw) {
  return /^0\d{9}$/.test(normalizePhone(raw));
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: undefined,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide.'],
    },
    phone: {
      type: String,
      trim: true,
      default: undefined,
      validate: {
        validator: (v) => v == null || /^0\d{9}$/.test(v),
        message: 'Numéro invalide (10 chiffres, commence par 0).',
      },
    },
    passwordHash: { type: String, default: null, select: false },
    // Changer de mot de passe invalide les sessions déjà émises (comparaison
    // avec l'iat du JWT dans le middleware protect).
    passwordChangedAt: { type: Date, default: null },
    googleId: { type: String, default: null, index: true },
    role: { type: String, enum: ['client', 'artisan', 'admin'], default: 'client', index: true },
    commune: { type: String, trim: true, default: '' },
    specialite: { type: String, trim: true, default: '' },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true },
);

// Un compte = au moins un identifiant (email, phone ou googleId).
userSchema.pre('validate', function (next) {
  if (!this.email && !this.phone && !this.googleId) {
    this.invalidate('email', 'Email, téléphone ou compte Google requis.');
  }
  next();
});

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email ?? null,
    phone: this.phone ?? null,
    role: this.role,
    commune: this.commune,
    specialite: this.specialite,
    avatarUrl: this.avatarUrl,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.models.User ?? mongoose.model('User', userSchema);
