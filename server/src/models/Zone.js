import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema(
  {
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArtisanProfile',
      required: true,
      index: true,
    },
    icon: { type: String, default: 'my_location', trim: true, maxlength: 40 },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    text: { type: String, default: '', trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

export const Zone = mongoose.models.Zone ?? mongoose.model('Zone', zoneSchema);
