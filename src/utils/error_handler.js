function errorHandler(err, _, res, _) {
  console.error(err);

  const statusCode = err.statusCode || 500; // <-- integer
  const status = err.status || (statusCode >= 500 ? 'error' : 'fail'); // string for JSON

  const messages = {
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Payload Too Large',
    414: 'URI Too Long',
    415: 'Unsupported Media Type',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
  };

  const message = err.message || messages[statusCode] || 'Error';

  res.status(statusCode).json({
    status,
    error: message
  });
}

module.exports = errorHandler;
