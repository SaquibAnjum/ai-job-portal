const mongoose = require('mongoose');

const resumeEmbeddingSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    rawText: {
      type: String,
      required: true,
    },
    skillsText: {
      type: String,
      default: '',
    },
    embeddingVector: [
      {
        type: Number,
      },
    ],
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResumeEmbedding', resumeEmbeddingSchema);
