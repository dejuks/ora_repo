import db from "../../config/db.js";

/* CREATE */
export const createPublicUser = (data) => {
  const {
    full_name,
    email,
    password_hash,
    affiliation,
    country,
  } = data;

  return db.query(
    `INSERT INTO public_users
     (full_name, email, password_hash, affiliation, country)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id, uuid, full_name, email, affiliation, country, is_verified, created_at`,
    [full_name, email, password_hash, affiliation, country]
  );
};

export const getPublicUserByEmail = (email) => {
  return db.query(
    `SELECT * FROM public_users WHERE email = $1`,
    [email]
  );
};

/* READ ALL */
export const getAllPublicUsers = () =>
  db.query(
    `SELECT id, uuid, full_name, email, affiliation, country, is_verified, created_at
     FROM public_users
     ORDER BY created_at DESC`
  );

/* READ ONE */
export const getPublicUserByUUID = (uuid) =>
  db.query(
    `SELECT id, uuid, full_name, email, affiliation, country, is_verified, created_at
     FROM public_users
     WHERE uuid = $1`,
    [uuid]
  );

/* UPDATE */
export const updatePublicUser = (uuid, data) => {
  const { full_name, affiliation, country } = data;

  return db.query(
    `UPDATE public_users
     SET full_name=$1, affiliation=$2, country=$3
     WHERE uuid=$4
     RETURNING id, uuid, full_name, email, affiliation, country, is_verified`,
    [full_name, affiliation, country, uuid]
  );
};

/* DELETE */
export const deletePublicUser = (uuid) =>
  db.query(`DELETE FROM public_users WHERE uuid=$1`, [uuid]);
