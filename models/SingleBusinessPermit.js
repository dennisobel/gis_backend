import mongoose from "mongoose";

const SingleBusinessPermitSchema = new mongoose.Schema({
  application_type: String,
  registered: String,
  business_name: String,
  branch_name: String,
  street: String,
  sub_county: String,
  ward: String,
  plot_no: String,
  building_name: String,
  floor_no: String,
  stall_no: String,
  business_category: String,
  business_sub_category: String,
  business_description: String,
  no_of_employees: String,
  additional_activity: String,
  premise_size: String,
  business_email: String,
  business_phone: String,
  postal_address: String,
  postal_code: String,
  contact_person_id: String,
  contact_person_role: String,
  contact_person_name: String,
  contact_person_email: String,
  contact_person_phone: String,
  business_coordinates: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const SingleBusinessPermit = mongoose.model('SingleBusinessPermit', SingleBusinessPermitSchema);

export default SingleBusinessPermit;
