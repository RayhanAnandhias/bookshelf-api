const errorHandling = (h, code, status, message) => {
  const response = h.response({
    status,
    message,
  });

  response.code(code);
  return response;
};

module.exports = errorHandling;
