const ok = (res, data = {}, message = 'OK', status = 200) => {
  return res.status(status).json({ success: true, message, data });
};

const error = (res, message = 'Error interno', status = 500, details = null) => {
  const body = { success: false, message };
  if (details) body.details = details;
  return res.status(status).json(body);
};

module.exports = { ok, error };
