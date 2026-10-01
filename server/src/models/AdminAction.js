import mongoose from 'mongoose';

// Journal d'administration : qui, quoi, sur quelle cible, quand.
// Écriture seule depuis l'API (aucune route de modification).
const adminActionSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: { type: String, required: true, trim: true, maxlength: 60, index: true },
    targetType: { type: String, required: true, trim: true, maxlength: 40, index: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

adminActionSchema.index({ createdAt: -1 });

export const AdminAction =
  mongoose.models.AdminAction ?? mongoose.model('AdminAction', adminActionSchema);
