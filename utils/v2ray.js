/**
 * V2Ray Configuration Generator
 * Supports: Vless, VMess, Shadowsocks, Trojan
 */

export async function generateV2RayConfig({
  protocol = 'vless',
  uuid,
  port = 443,
  security = 'tls',
  transport = 'tcp',
  host = 'example.com',
  path = '/'
} = {}) {
  const baseConfig = {
    log: {
      loglevel: process.env.V2RAY_LOG_LEVEL || 'warning'
    },
    inbounds: [],
    outbounds: [
      {
        protocol: 'freedom',
        tag: 'direct'
      },
      {
        protocol: 'blackhole',
        tag: 'block'
      }
    ],
    routing: {
      rules: [
        {
          type: 'field',
          outboundTag: 'block',
          domain: ['geosite:category-ads-all']
        }
      ]
    }
  };

  // Add inbound based on protocol
  switch (protocol.toLowerCase()) {
    case 'vless':
      baseConfig.inbounds.push({
        port: port,
        protocol: 'vless',
        settings: {
          clients: [{ id: uuid }],
          decryption: 'none'
        },
        streamSettings: {
          network: transport,
          security: security,
          tlsSettings: security === 'tls' ? { serverName: host } : undefined,
          wsSettings: transport === 'ws' ? { path: path, host: host } : undefined
        }
      });
      break;

    case 'vmess':
      baseConfig.inbounds.push({
        port: port,
        protocol: 'vmess',
        settings: {
          clients: [{ id: uuid, alterId: 64 }]
        },
        streamSettings: {
          network: transport,
          security: security,
          tlsSettings: security === 'tls' ? { serverName: host } : undefined,
          wsSettings: transport === 'ws' ? { path: path, host: host } : undefined
        }
      });
      break;

    case 'trojan':
      baseConfig.inbounds.push({
        port: port,
        protocol: 'trojan',
        settings: {
          clients: [{ password: uuid }]
        },
        streamSettings: {
          network: 'tcp',
          security: 'tls',
          tlsSettings: { serverName: host }
        }
      });
      break;

    case 'shadowsocks':
      baseConfig.inbounds.push({
        port: port,
        protocol: 'shadowsocks',
        settings: {
          method: 'chacha20-poly1305',
          password: uuid,
          network: 'tcp,udp'
        }
      });
      break;
  }

  return baseConfig;
}

/**
 * Obfuscate config for anti-detection
 */
export function obfuscateConfig(config) {
  // Add random delays and headers
  if (config.inbounds?.[0]?.streamSettings?.wsSettings) {
    config.inbounds[0].streamSettings.wsSettings.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache'
    };
  }

  return config;
}
