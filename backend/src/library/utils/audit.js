export async function writeLibraryAuditLog(action, details = {}, req = null) {
    try {
      return {
        success: true,
        action,
        details,
        user_id: req?.user?.id || req?.user?.uuid || null,
        ip_address: req?.ip || null,
        user_agent: req?.headers?.["user-agent"] || null,
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Audit log error:", error);
      return null;
    }
  }
  
  export async function logAudit(action, details = {}, req = null) {
    return writeLibraryAuditLog(action, details, req);
  }
  
  export async function audit(action, details = {}, req = null) {
    return writeLibraryAuditLog(action, details, req);
  }
  
  export default {
    writeLibraryAuditLog,
    logAudit,
    audit,
  };