import { join } from 'path';

export const PROTO_PATH = {
  USER: join(__dirname, '..', 'user.proto'),
  MEDIA: join(__dirname, '..', 'media.proto'),
};

export const PROTO_PACKAGE = {
  USER: 'user',
  MEDIA: 'media',
};
