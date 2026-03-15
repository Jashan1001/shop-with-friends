const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      let issues = [];
      try {
        issues = JSON.parse(err.message);
      } catch {
        issues = [{ field: 'unknown', message: err.message }];
      }

      const errors = issues.map((e) => ({
        field: (e.path || []).join('.'),
        message: e.message,
      }));

      return res.status(400).json({ success: false, errors });
    }
    next(err);
  }
};

module.exports = validate;