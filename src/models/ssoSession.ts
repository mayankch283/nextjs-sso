// src/models/ssoSession.ts
import mongoose from 'mongoose';

const ssoSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    callbackUrl: {
      type: String,
      required: true,
    },
    state: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for performance
ssoSessionSchema.index({ sessionId: 1 });
ssoSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic cleanup

const SSOSession = mongoose.models.ssoSessions || mongoose.model('ssoSessions', ssoSessionSchema);
export default SSOSession;