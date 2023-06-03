const { json } = require("express");
const { print } = require("../common/common");
class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};
    print(keyword);
    this.query = this.query.find({ ...keyword });
    return this;
  }
  filter() {
    const queryCopy = { ...this.queryStr };
    const removeFields = ["keyword", "page", "limit"];
    removeFields.forEach((key) => delete queryCopy[key]);
    print(queryCopy);

    // [FILTER FOR PRICE AND RATING]
    let queryStr = JSON.stringify(queryCopy);
    print(queryStr);
    queryStr = queryStr.replace(/\b(gt|lt|gte|lte)\b/g, (key) => `$${key}`);

    print(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // [PAGINATION]
  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    print(currentPage);
    const skip = resultPerPage * (currentPage - 1);
    this.query = this.query.limit(resultPerPage).skip(skip);
    return this;
  }
}

module.exports = ApiFeatures;
