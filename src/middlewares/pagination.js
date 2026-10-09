const pagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit,
  };

  next();
};

export default pagination;
