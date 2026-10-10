// Adds the standard `success` flag (plus an `error` string on failures) to every JSON
// object response. Existing `message` / `data` / `token` fields are left untouched so
// current frontend code keeps working.
const standardizeResponse = (req, res, next) => {
  const json = res.json.bind(res);

  res.json = (body) => {
    if (body && body.constructor === Object && !("success" in body)) {
      const success = res.statusCode < 400;
      body = { success, ...body };
      if (!success) {
        // Never leak raw error objects (stack traces, driver internals) to clients.
        body.error =
          typeof body.error === "string"
            ? body.error
            : body.message || "Something went wrong";
      }
    }
    return json(body);
  };

  next();
};

const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);

  const exposeMessage = status < 500 || process.env.NODE_ENV !== "production";
  res.status(status).json({
    message: exposeMessage ? err.message : "Something went wrong",
  });
};

module.exports = { standardizeResponse, notFound, errorHandler };
