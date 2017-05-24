import Either from 'data.either';
import { NotFoundError } from '../../utils';

let uid;
let db;

const create = resource => {
  uid++;
  const newResource = { ...resource, id: uid };
  db = {
    ...db,
    [uid]: newResource,
  };
  return Either.Right(newResource);
};

const read = () => {
  const resources = Object.keys(db).map(key => db[key]);
  return Either.Right(resources);
};

const readById = id => {
  const resource = db[id];
  if (!resource) {
    return Either.Left(new NotFoundError());
  }
  return Either.Right(resource);
};

const update = (id, resource) => {
  const existing = readById(id);

  if (existing.isLeft) {
    return existing;
  }

  const updatedResource = { id, ...resource };

  db = {
    ...db,
    [id]: updatedResource,
  };

  return Either.Right(updatedResource);
};

const destroy = id => {
  const resource = db[id];

  if (!resource) {
    return Either.Left(new NotFoundError());
  }

  delete db[id];
  return Either.Right();
};

export default () => {
  db = {};
  uid = 0;
  return {
    create,
    read,
    readById,
    update,
    delete: destroy,
  };
};
