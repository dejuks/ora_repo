import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (email, password) => {
  const result = await pool.query(
    `
    SELECT 
      u.uuid,
      u.full_name,
      u.email,
      u.password,
      u.module_id,
      m.name AS module_name,

      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'role_id', r.uuid,
            'name', r.name
          )
        ) FILTER (WHERE r.uuid IS NOT NULL),
        '[]'
      ) AS roles

    FROM users u
    LEFT JOIN modules m ON m.uuid = u.module_id
    LEFT JOIN user_roles ur ON ur.user_id = u.uuid
    LEFT JOIN roles r ON r.uuid = ur.role_id
    WHERE u.email = $1
    GROUP BY u.uuid, m.name
    `,
    [email]
  );

  const user = result.rows[0];
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const token = jwt.sign(
    {
      uuid: user.uuid,
      module_id: user.module_id,
      roles: user.roles.map(r => r.role_id),
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      uuid: user.uuid,
      full_name: user.full_name,
      email: user.email,
      module_id: user.module_id,
      module_name: user.module_name,
      roles: user.roles, // ✅ THIS IS THE KEY FIX
    },
  };
};


// email verifications
// import pool from "../config/db.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// export const login = async (email, password) => {
//   const result = await pool.query(
//     `
//     SELECT 
//       u.uuid,
//       u.full_name,
//       u.email,
//       u.password,
//       u.module_id,
//       u.is_verified,
//       m.name AS module_name,

//       COALESCE(
//         json_agg(
//           DISTINCT jsonb_build_object(
//             'role_id', r.uuid,
//             'name', r.name
//           )
//         ) FILTER (WHERE r.uuid IS NOT NULL),
//         '[]'
//       ) AS roles

//     FROM users u
//     LEFT JOIN modules m ON m.uuid = u.module_id
//     LEFT JOIN user_roles ur ON ur.user_id = u.uuid
//     LEFT JOIN roles r ON r.uuid = ur.role_id
//     WHERE u.email = $1
//     GROUP BY 
//       u.uuid,
//       u.full_name,
//       u.email,
//       u.password,
//       u.module_id,
//       u.is_verified,
//       m.name
//     `,
//     [email]
//   );

//   const user = result.rows[0];

//   if (!user) {
//     throw new Error("Invalid email or password");
//   }

//   // ✅ Block unverified users
//   if (!user.is_verified) {
//     throw new Error("Please verify your email before login");
//   }

//   // ✅ Compare password
//   const isMatch = await bcrypt.compare(password, user.password);

//   if (!isMatch) {
//     throw new Error("Invalid email or password");
//   }

//   // ✅ Extract role IDs safely
//   const roleIds = Array.isArray(user.roles)
//     ? user.roles.map(r => r.role_id)
//     : [];

//   // ✅ Generate JWT
//   const token = jwt.sign(
//     {
//       uuid: user.uuid,
//       module_id: user.module_id,
//       roles: roleIds,
//     },
//     process.env.JWT_SECRET,
//     {
//       expiresIn: process.env.JWT_EXPIRES_IN || "7d",
//     }
//   );

//   return {
//     message: "Login successful",
//     token,
//     user: {
//       uuid: user.uuid,
//       full_name: user.full_name,
//       email: user.email,
//       module_id: user.module_id,
//       module_name: user.module_name,
//       roles: user.roles,
//     },
//   };
// };
