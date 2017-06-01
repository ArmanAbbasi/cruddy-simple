import Either from 'data.either';
import { NotFoundError } from '../../utils';

let uid;
let db;

const create = hateosLink => resource => {
  uid++;

  const id = uid;
  const newResource = { ...resource, id };

  if (hateosLink) {
    const updatedResource = hateosLink(id, newResource);
    db = {
      ...db,
      [uid]: updatedResource,
    };
    return Either.Right(updatedResource);
  }

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

export default hateosLink => {
  db = {};
  uid = 0;
  return {
    create: create(hateosLink),
    read,
    readById,
    update,
    delete: destroy,
  };
};
