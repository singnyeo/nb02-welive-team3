import { ErrorRequestHandler } from 'express';
import {
  isErrorInstanceOfHttp,
  isErrorInstanceOfJwt,
  isErrorInstanceOfMulter,
  isErrorInstanceOfNode,
} from '../utils/error.util';
import { getIp, getMethod, getUrl } from '../utils/from.util';

export const globalErrorHandler: ErrorRequestHandler = async (error, req, res, _next) => {
  let status = 500;
  let message = 'Internal Server Error';

  if (isErrorInstanceOfHttp(error)) {
    status = error.status;
    message = error.message;
  } else if (isErrorInstanceOfMulter(error)) {
    status = 400;
    message = error.message;
  } else if (isErrorInstanceOfJwt(error)) {
    status = 401;
    message = error.message;
  } else if (isErrorInstanceOfNode(error)) {
    status = 500;
    message = error.message;
  }

  const log = {
    ip: getIp(req),
    method: getMethod(req),
    url: getUrl(req),
    status: String(status),
    createdAt: new Date(),
    message: message,
  };

  console.error(log);

  const response = {
    message,
  };

  res.status(status).json(response);
};
