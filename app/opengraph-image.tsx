import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'DABADA - Video Downloader';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Main Title */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          DABADA
        </div>
        
        {/* Subtitle */}
        <div
          style={{
            fontSize: 36,
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: 40,
            textAlign: 'center',
          }}
        >
          Video Downloader
        </div>
        
        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            alignItems: 'center',
            marginTop: 40,
          }}
        >
          {/* YouTube Icon */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
              }}
            >
              ▶
            </div>
            <div
              style={{
                fontSize: 24,
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 600,
              }}
            >
              YouTube
            </div>
          </div>
          
          {/* Plus Icon */}
          <div
            style={{
              fontSize: 48,
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            +
          </div>
          
          {/* Instagram Icon */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
              }}
            >
              📷
            </div>
            <div
              style={{
                fontSize: 24,
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 600,
              }}
            >
              Instagram
            </div>
          </div>
        </div>
        
        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255, 255, 255, 0.8)',
            marginTop: 50,
            textAlign: 'center',
          }}
        >
          Download videos easily and quickly
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
