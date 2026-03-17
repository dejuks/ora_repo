
ORA Library Permission Package

This package adds missing permissions and can be extended to map permissions
to roles in the role_permissions table.

Tables expected:
- roles(id, name)
- permissions(id, name, module_group)
- role_permissions(role_id, permission_id)

Run using PostgreSQL:

psql -U username -d database -f ora_library_permissions.sql

The SQL safely uses ON CONFLICT DO NOTHING so existing permissions are not duplicated.
