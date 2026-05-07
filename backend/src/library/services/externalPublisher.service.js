class ExternalPublisherService {
    async index() {
      return [];
    }
  
    async show(id) {
      return {
        id,
        name: "Sample Publisher",
        contact_email: null,
        contact_phone: null,
        website: null,
        address: null,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  
    async store(payload) {
      return {
        id: Date.now(),
        ...payload,
        status: payload?.status || "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  
    async update(id, payload) {
      return {
        id,
        ...payload,
        updated_at: new Date().toISOString(),
      };
    }
  
    async destroy(id) {
      return {
        id,
        deleted: true,
      };
    }
  }
  
  const externalPublisherService = new ExternalPublisherService();
  export default externalPublisherService;