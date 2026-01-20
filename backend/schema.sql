CREATE DATABASE user_management;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  password TEXT,
  gender VARCHAR(10),
  dob DATE,
  module_id UUID REFERENCES modules(uuid), -- <--- new column
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE roles (
  uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  module_id UUID NOT NULL REFERENCES modules(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
  uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(uuid) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(uuid) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(uuid) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(uuid) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);


INSERT INTO role_permissions (role_id, permission_id)
SELECT r.uuid, p.uuid
FROM roles r, permissions p
WHERE r.name = 'admin' AND p.name = 'role.manage'
ON CONFLICT DO NOTHING;




INSERT INTO user_roles (user_id, role_id)
SELECT u.uuid, r.uuid
FROM users u, roles r
WHERE u.email = 'anire@example.com' AND r.name = 'admin'
ON CONFLICT DO NOTHING;

CREATE TABLE modules (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

