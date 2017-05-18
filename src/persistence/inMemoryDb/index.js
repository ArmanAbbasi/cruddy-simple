import Either from 'data.either';
import { NotFoundError } from '../../utils';

let uid;
let db;

const create = blob => {
  uid++;
  const newFilm = { ...blob, id: uid };
  db = {
    ...db,
    [uid]: newFilm,
  };
  return Either.Right(newFilm);
};

const read = () => Either.Right(Object.keys(db).map(key => db[key]));

const readById = id => {
  if (!db[id]) {
    return Either.Left(new NotFoundError());
  }
  return Either.Right({ ...db[id] });
};

const update = (id, blob) => {
  const existingFilm = readById(id);

  if (existingFilm.isLeft) {
    return existingFilm;
  }
  const updatedData = { id, ...blob };

  db = {
    ...db,
    [id]: updatedData,
  };

  return Either.Right(updatedData);
};

const destroy = id => {
  const deletedItem = db[id];
  if (deletedItem) {
    delete db[id];
    return Either.Right(deletedItem);
  }
  return Either.Left(new NotFoundError());
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
