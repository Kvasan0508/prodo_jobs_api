const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  qualifications: {
    type: String,
    required: true,
  },
  salaryRange: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  workType: {
    type: String,
    required: true,
  },
  companySize: {
    type: Number,
    required: true,
  },
  jobPostingDate: {
    type: Date,
    required: true,
  },
  preference: {
    type: String,
  },
  contactPerson: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  jobPortal: {
    type: String,
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  benefits: {
    type: [String],
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  responsibilities: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  companyProfile: {
    sector: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zip: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: true,
    },
    ticker: {
      type: String,
      required: true,
    },
    ceo: {
      type: String,
      required: true,
    },
  },
});

const Job = mongoose.model("job_list", jobSchema);

module.exports = Job;
