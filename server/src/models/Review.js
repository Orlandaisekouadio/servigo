import mongoose from 'mongoose';

// Lecture seule en itération 2 (écriture + recalcul note en itération 3).
const reviewSchema = new mongoose.Schema(
  {
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArtisanProfile',
      required: true,
      index: true,
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: undefined },
    authorName: { type: String, required: true, trim: true, maxlength: 120 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    service: { type: String, default: '', trim: true, maxlength: 160 },
    location: { type: String, default: '', trim: true, maxlength: 160 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

reviewSchema.index({ artisan: 1, createdAt: -1 });
// Anti-doublon quand l'auteur est un compte : index partiel (les avis seedés
// sans auteur n'y figurent pas — un sparse composé indexerai quand même author:null).
reviewSchema.index(
  { artisan: 1, author: 1 },
  { unique: true, partialFilterExpression: { author: { $exists: true } } },
);

export const Review =
  mongoose.models.Review ?? mongoose.model('Review', reviewSchema);
