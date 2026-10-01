import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema(
  {
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArtisanProfile',
      required: true,
      index: true,
    },
    imageUrl: { type: String, default: '' },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    subtitle: { type: String, default: '', trim: true, maxlength: 160 },
    text: { type: String, default: '', trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

export const GalleryItem =
  mongoose.models.GalleryItem ?? mongoose.model('GalleryItem', galleryItemSchema);
