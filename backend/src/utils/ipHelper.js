// utils/ipHelper.js

/**
 * Extract client IP address from request object
 * Handles various proxy headers and fallbacks
 */
export const getClientIp = (req) => {
  // Method 1: Check x-forwarded-for header (when behind proxy/load balancer)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
    // Take the first one which is the actual client IP
    return forwardedFor.split(',')[0].trim();
  }
  
  // Method 2: Check x-real-ip header (common with nginx)
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return realIp;
  }
  
  // Method 3: Check x-client-ip header
  const clientIp = req.headers['x-client-ip'];
  if (clientIp) {
    return clientIp;
  }
  
  // Method 4: Check cf-connecting-ip (Cloudflare)
  const cloudflareIp = req.headers['cf-connecting-ip'];
  if (cloudflareIp) {
    return cloudflareIp;
  }
  
  // Method 5: Use Express's req.ip (if trust proxy is enabled)
  if (req.ip) {
    return req.ip;
  }
  
  // Method 6: Fall back to socket remote address
  if (req.socket && req.socket.remoteAddress) {
    return req.socket.remoteAddress;
  }
  
  // Method 7: Check connection object
  if (req.connection && req.connection.remoteAddress) {
    return req.connection.remoteAddress;
  }
  
  // Last resort fallback
  return '0.0.0.0';
};

/**
 * Optional: Anonymize IP address for privacy (GDPR compliance)
 * IPv4: 192.168.1.100 -> 192.168.1.0
 * IPv6: 2001:db8::1234 -> 2001:db8::/64
 */
export const anonymizeIp = (ip) => {
  if (!ip) return '0.0.0.0';
  
  // Check if IPv4
  if (ip.includes('.')) {
    // Anonymize IPv4: keep first 3 octets, set last to 0
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '0';
      return parts.join('.');
    }
  }
  
  // Check if IPv6
  if (ip.includes(':')) {
    // Anonymize IPv6: keep first 64 bits (simplified approach)
    // Remove port if present
    ip = ip.split(':').slice(0, 4).join(':') + '::/64';
    return ip;
  }
  
  return ip;
};