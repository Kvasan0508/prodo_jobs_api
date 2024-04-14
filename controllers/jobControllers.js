const mongoose = require("mongoose");
const Jobs = require("../models/jobsModal");
const Preference = require("../models/jobsDescModel");
exports.searchJobs = async (req, res, next) => {
  const keyword = req?.query?.keyword || "";
  const page = Number(req?.query?.page) || 0;

  const dataQuery = keyword?.length > 0 ? keyword : "*";
  try {
    const jobs = await Jobs.aggregate([
      {
        $search: {
          index: "job_search_index",
          facet: {
            operator:
              dataQuery === "*"
                ? {
                    queryString: {
                      query: "*",
                      defaultPath: "*",
                    },
                  }
                : {
                    text: {
                      query: dataQuery,
                      path: {
                        wildcard: "*",
                      },
                    },
                  },
            facets: {
              Qualifications: {
                type: "string",
                path: "Qualifications",
              },
            },
          },
        },
      },
      {
        $facet: {
          submissionData: [
            {
              $skip: page,
            },
            {
              $limit: 25,
            },
          ],
          count: [
            {
              $replaceWith: "$$SEARCH_META",
            },
            {
              $limit: 1,
            },
          ],
        },
      },
    ]);
    res.status(200).json(jobs);
  } catch (err) {
    next(err);
  }
};

exports.addData = async (req, res, next) => {
  try {
    const { description, userId } = req?.body || {};

    // Check if a document with the given userId already exists
    let details = await Preference.findOne({ userId: userId });

    if (details) {
      // If a document exists, update it
      details.description = description;
      await details.save();
    } else {
      // If a document does not exist, create a new one
      details = new Preference({ userId: userId, description: description });
      await details.save();
    }

    res.status(200).json({ success: true, data: details });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
exports.getDesc = async (req, res, next) => {
  try {
    const userId = req.params.id;
    let details = await Preference.findOne({ userId: userId });
    if (!details) {
      return res?.status(200).json({ data: "" });
    }
    return res?.status(200).json({ data: details?.description });
  } catch (err) {
    console.log(err);
  }
};
