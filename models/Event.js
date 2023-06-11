import mongoose, {Schema} from "mongoose";
import LocationSchema from "./Location.js";

const EventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "login",
        "business_registration",
        "payment_verification",
        "business_verification",
        "info_request",
        "store_checkin",
        "business_escalation",
        "business_deescalation",
        "activity"
      ],
    },
    coordinates: {
      type: LocationSchema,
      required: true
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: 'SingleBusinessPermit',
      required: false
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    description: String,
    request_path: String,
    request_data: {
      type: String,
      required: false
    },
    response_status: Number,
    error_desc: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", EventSchema);
export default Event;
