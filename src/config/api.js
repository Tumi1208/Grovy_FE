const API_PROTOCOL = 'http';
// Android emulator must use 10.0.2.2 to reach the host machine.
// If you test on a physical Android device later, replace this with your
// computer's LAN IP address on the same network.
const API_HOST = '10.0.2.2';
// Keep this aligned with Grovy_BE/.env PORT.
const API_PORT = '5050';
const API_PREFIX = '/api/v1';

export const API_CONFIG = {
  protocol: API_PROTOCOL,
  host: API_HOST,
  port: API_PORT,
  prefix: API_PREFIX,
};

export const API_BASE_URL = `${API_CONFIG.protocol}://${API_CONFIG.host}:${API_CONFIG.port}${API_CONFIG.prefix}`;
