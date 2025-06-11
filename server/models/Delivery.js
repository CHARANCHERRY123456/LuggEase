import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  pickupLocation: {
    address: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    contactName: String,
    contactPhone: String,
    instructions: String
  },
  dropLocation: {
    address: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    contactName: String,
    contactPhone: String,
    instructions: String
  },
  items: [{
    description: {
      type: String,
      required: true
    },
    weight: {
      type: Number,
      required: true
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    value: Number,
    fragile: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: [
      'pending',
      'assigned',
      'picked_up',
      'in_transit',
      'delivered',
      'cancelled'
    ],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  scheduledPickup: {
    type: Date,
    default: Date.now
  },
  estimatedDelivery: Date,
  actualPickupTime: Date,
  actualDeliveryTime: Date,
  deliveryFee: {
    type: Number,
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  estimatedDuration: Number,
  tracking: [{
    status: String,
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  rating: {
    customerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    driverRating: {
      type: Number,
      min: 1,
      max: 5
    },
    customerFeedback: String,
    driverFeedback: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  autoAssignedAt: Date,
  isUrgent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Calculate delivery fee based on distance and priority
deliverySchema.pre('save', function(next) {
  if (this.isNew || this.isModified('distance') || this.isModified('priority')) {
    let baseFee = 5; // Base fee
    let distanceFee = this.distance * 0.5; // $0.5 per km
    let priorityMultiplier = 1;
    
    switch (this.priority) {
      case 'high':
        priorityMultiplier = 1.5;
        break;
      case 'urgent':
        priorityMultiplier = 2;
        break;
      default:
        priorityMultiplier = 1;
    }
    
    this.deliveryFee = Math.round((baseFee + distanceFee) * priorityMultiplier * 100) / 100;
  }
  next();
});

// Transform _id to id for frontend
deliverySchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('Delivery', deliverySchema);