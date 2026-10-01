import mongoose from 'mongoose';

// Jeton de réinitialisation : on ne stocke que le SHA-256 du token envoyé par
// email. Un accès à la base ne permet donc aucun reset exploitable.
const passwordResetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Purge automatique des tokens expirés par Mongo.
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordReset =
  mongoose.models.PasswordReset ?? mongoose.model('PasswordReset', passwordResetSchema);
