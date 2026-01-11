/**
 * WebRTC Signaling Server for BIGO Live Clone
 * Handles SDP offer/answer exchange and ICE candidate collection
 * Uses Cloudflare Workers with Durable Objects for room state management
 */

/**
 * Durable Object for managing a streaming room
 * Stores session data, SDP offers/answers, and ICE candidates
 */
export class StreamRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.roomId = state.id;
    this.broadcasterId = null;
    this.viewerIds = new Set();
    this.broadcasterSDP = null;
    this.viewerSDPs = new Map();
    this.iceCandidates = new Map();
  }

  async initialize(broadcasterId) {
    this.broadcasterId = broadcasterId;
    this.iceCandidates.set(broadcasterId, []);
    await this.state.storage.put('room_data', {
      broadcasterId,
      viewerIds: Array.from(this.viewerIds),
      createdAt: new Date().toISOString(),
    });
  }

  async addViewer(viewerId) {
    this.viewerIds.add(viewerId);
    this.iceCandidates.set(viewerId, []);
    await this.state.storage.put('room_data', {
      broadcasterId: this.broadcasterId,
      viewerIds: Array.from(this.viewerIds),
      updatedAt: new Date().toISOString(),
    });
  }

  async storeBroadcasterSDP(sdp) {
    this.broadcasterSDP = sdp;
    await this.state.storage.put(`broadcaster_sdp_${this.broadcasterId}`, sdp);
  }

  async storeViewerSDP(viewerId, sdp) {
    this.viewerSDPs.set(viewerId, sdp);
    await this.state.storage.put(`viewer_sdp_${viewerId}`, sdp);
  }

  async addICECandidate(peerId, candidate) {
    if (!this.iceCandidates.has(peerId)) {
      this.iceCandidates.set(peerId, []);
    }
    this.iceCandidates.get(peerId).push(candidate);
    await this.state.storage.put(`ice_${peerId}`, this.iceCandidates.get(peerId));
  }

  async getICECandidates(peerId) {
    return this.iceCandidates.get(peerId) || [];
  }

  async getBroadcasterSDP() {
    return this.broadcasterSDP || (await this.state.storage.get(`broadcaster_sdp_${this.broadcasterId}`));
  }

  async getViewerSDP(viewerId) {
    return this.viewerSDPs.get(viewerId) || (await this.state.storage.get(`viewer_sdp_${viewerId}`));
  }

  async getRoomData() {
    return {
      roomId: this.roomId,
      broadcasterId: this.broadcasterId,
      viewerCount: this.viewerIds.size,
      viewerIds: Array.from(this.viewerIds),
      createdAt: await this.state.storage.get('room_data'),
    };
  }

  async cleanup() {
    await this.state.storage.deleteAll();
  }

  async fetch(request) {
    const body = await request.json().catch(() => ({}));
    const action = body.action;

    switch (action) {
      case 'initialize':
        await this.initialize(body.broadcasterId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });

      case 'store_broadcaster_sdp':
        await this.storeBroadcasterSDP(body.sdp);
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });

      case 'get_broadcaster_sdp':
        const broadcasterSDP = await this.getBroadcasterSDP();
        return new Response(broadcasterSDP || '', {
          headers: { 'Content-Type': 'application/json' },
        });

      case 'add_viewer':
        await this.addViewer(body.viewerId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });

      case 'store_viewer_sdp':
        await this.storeViewerSDP(body.viewerId, body.sdp);
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });

      case 'get_viewer_sdp':
        const viewerSDP = await this.getViewerSDP(body.viewerId);
        return new Response(viewerSDP || '', {
          headers: { 'Content-Type': 'application/json' },
        });

      case 'add_ice':
        await this.addICECandidate(body.peerId, body.candidate);
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });

      case 'get_ice':
        const candidates = await this.getICECandidates(body.peerId);
        return new Response(JSON.stringify(candidates), {
          headers: { 'Content-Type': 'application/json' },
        });

      case 'get_room_data':
        const roomData = await this.getRoomData();
        return new Response(JSON.stringify(roomData), {
          headers: { 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }
  }
}

/**
 * Main Worker Handler
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Enable CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Routes
      if (path === '/api/rooms' && method === 'POST') {
        return handleCreateRoom(request, env, corsHeaders);
      } else if (path.match(/^\/api\/rooms\/[^/]+\/broadcaster-sdp$/) && method === 'POST') {
        return handleStoreBroadcasterSDP(request, env, corsHeaders);
      } else if (path.match(/^\/api\/rooms\/[^/]+\/broadcaster-sdp$/) && method === 'GET') {
        return handleGetBroadcasterSDP(request, env, corsHeaders);
      } else if (path.match(/^\/api\/rooms\/[^/]+\/viewers$/) && method === 'POST') {
        return handleAddViewer(request, env, corsHeaders);
      } else if (path.match(/^\/api\/rooms\/[^/]+\/viewer-sdp$/) && method === 'POST') {
        return handleStoreViewerSDP(request, env, corsHeaders);
      } else if (path.match(/^\/api\/rooms\/[^/]+\/viewer-sdp$/) && method === 'GET') {
        return handleGetViewerSDP(request, env, corsHeaders);
      } else if (path.match(/^\/api\/rooms\/[^/]+\/ice$/) && method === 'POST') {
        return handleAddICECandidate(request, env, corsHeaders);
      } else if (path.match(/^\/api\/rooms\/[^/]+\/ice$/) && method === 'GET') {
        return handleGetICECandidates(request, env, corsHeaders);
      } else if (path.match(/^\/api\/rooms\/[^/]+$/) && method === 'GET') {
        return handleGetRoom(request, env, corsHeaders);
      } else if (path === '/health') {
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } else {
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Internal server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
  },
};

/**
 * Handler: Create a new streaming room
 * POST /api/rooms
 * Body: { broadcasterId: string, streamId: string }
 */
async function handleCreateRoom(request, env, corsHeaders) {
  const body = await request.json();
  const { broadcasterId, streamId } = body;

  if (!broadcasterId || !streamId) {
    return new Response(JSON.stringify({ error: 'broadcasterId and streamId required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const roomId = `${streamId}_${Date.now()}`;
  const durableObjectId = env.STREAM_ROOM.idFromName(roomId);
  const room = env.STREAM_ROOM.get(durableObjectId);

  // Initialize room
  await room.fetch(
    new Request('http://internal', {
      method: 'POST',
      body: JSON.stringify({ action: 'initialize', broadcasterId }),
    })
  );

  return new Response(JSON.stringify({ roomId, message: 'Room created' }), {
    status: 201,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

/**
 * Handler: Store broadcaster's SDP offer
 * POST /api/rooms/:roomId/broadcaster-sdp
 * Body: { broadcasterId: string, sdp: string }
 */
async function handleStoreBroadcasterSDP(request, env, corsHeaders) {
  const roomId = new URL(request.url).pathname.split('/')[3];
  const body = await request.json();
  const { broadcasterId, sdp } = body;

  if (!sdp) {
    return new Response(JSON.stringify({ error: 'SDP required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const durableObjectId = env.STREAM_ROOM.idFromName(roomId);
  const room = env.STREAM_ROOM.get(durableObjectId);

  // Store SDP via Durable Object
  const result = await room.fetch(
    new Request('http://internal', {
      method: 'POST',
      body: JSON.stringify({ action: 'store_broadcaster_sdp', broadcasterId, sdp }),
    })
  );

  return new Response(JSON.stringify({ success: true, roomId }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

/**
 * Handler: Retrieve broadcaster's SDP offer
 * GET /api/rooms/:roomId/broadcaster-sdp?broadcasterId=...
 */
async function handleGetBroadcasterSDP(request, env, corsHeaders) {
  const url = new URL(request.url);
  const roomId = url.pathname.split('/')[3];
  const broadcasterId = url.searchParams.get('broadcasterId');

  if (!broadcasterId) {
    return new Response(JSON.stringify({ error: 'broadcasterId query param required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const durableObjectId = env.STREAM_ROOM.idFromName(roomId);
  const room = env.STREAM_ROOM.get(durableObjectId);

  const result = await room.fetch(
    new Request('http://internal', {
      method: 'GET',
      body: JSON.stringify({ action: 'get_broadcaster_sdp', broadcasterId }),
    })
  );

  const sdp = await result.text();

  if (!sdp) {
    return new Response(JSON.stringify({ error: 'SDP not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  return new Response(JSON.stringify({ sdp }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

/**
 * Handler: Add viewer to room
 * POST /api/rooms/:roomId/viewers
 * Body: { viewerId: string }
 */
async function handleAddViewer(request, env, corsHeaders) {
  const roomId = new URL(request.url).pathname.split('/')[3];
  const body = await request.json();
  const { viewerId } = body;

  if (!viewerId) {
    return new Response(JSON.stringify({ error: 'viewerId required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const durableObjectId = env.STREAM_ROOM.idFromName(roomId);
  const room = env.STREAM_ROOM.get(durableObjectId);

  await room.fetch(
    new Request('http://internal', {
      method: 'POST',
      body: JSON.stringify({ action: 'add_viewer', viewerId }),
    })
  );

  return new Response(JSON.stringify({ success: true, viewerId }), {
    status: 201,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

/**
 * Handler: Store viewer's SDP answer
 * POST /api/rooms/:roomId/viewer-sdp
 * Body: { viewerId: string, sdp: string }
 */
async function handleStoreViewerSDP(request, env, corsHeaders) {
  const roomId = new URL(request.url).pathname.split('/')[3];
  const body = await request.json();
  const { viewerId, sdp } = body;

  if (!sdp) {
    return new Response(JSON.stringify({ error: 'SDP required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const durableObjectId = env.STREAM_ROOM.idFromName(roomId);
  const room = env.STREAM_ROOM.get(durableObjectId);

  await room.fetch(
    new Request('http://internal', {
      method: 'POST',
      body: JSON.stringify({ action: 'store_viewer_sdp', viewerId, sdp }),
    })
  );

  return new Response(JSON.stringify({ success: true, viewerId }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

/**
 * Handler: Retrieve viewer's SDP answer
 * GET /api/rooms/:roomId/viewer-sdp?viewerId=...
 */
async function handleGetViewerSDP(request, env, corsHeaders) {
  const url = new URL(request.url);
  const roomId = url.pathname.split('/')[3];
  const viewerId = url.searchParams.get('viewerId');

  if (!viewerId) {
    return new Response(JSON.stringify({ error: 'viewerId query param required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const durableObjectId = env.STREAM_ROOM.idFromName(roomId);
  const room = env.STREAM_ROOM.get(durableObjectId);

  const result = await room.fetch(
    new Request('http://internal', {
      method: 'GET',
      body: JSON.stringify({ action: 'get_viewer_sdp', viewerId }),
    })
  );

  const sdp = await result.text();

  if (!sdp) {
    return new Response(JSON.stringify({ error: 'SDP not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  return new Response(JSON.stringify({ sdp }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

/**
 * Handler: Add ICE candidate
 * POST /api/rooms/:roomId/ice
 * Body: { peerId: string, candidate: object }
 */
async function handleAddICECandidate(request, env, corsHeaders) {
  const roomId = new URL(request.url).pathname.split('/')[3];
  const body = await request.json();
  const { peerId, candidate } = body;

  if (!peerId || !candidate) {
    return new Response(JSON.stringify({ error: 'peerId and candidate required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const durableObjectId = env.STREAM_ROOM.idFromName(roomId);
  const room = env.STREAM_ROOM.get(durableObjectId);

  await room.fetch(
    new Request('http://internal', {
      method: 'POST',
      body: JSON.stringify({ action: 'add_ice', peerId, candidate }),
    })
  );

  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

/**
 * Handler: Get ICE candidates
 * GET /api/rooms/:roomId/ice?peerId=...
 */
async function handleGetICECandidates(request, env, corsHeaders) {
  const url = new URL(request.url);
  const roomId = url.pathname.split('/')[3];
  const peerId = url.searchParams.get('peerId');

  if (!peerId) {
    return new Response(JSON.stringify({ error: 'peerId query param required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const durableObjectId = env.STREAM_ROOM.idFromName(roomId);
  const room = env.STREAM_ROOM.get(durableObjectId);

  const result = await room.fetch(
    new Request('http://internal', {
      method: 'GET',
      body: JSON.stringify({ action: 'get_ice', peerId }),
    })
  );

  const candidates = await result.json();

  return new Response(JSON.stringify({ candidates }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

/**
 * Handler: Get room info
 * GET /api/rooms/:roomId
 */
async function handleGetRoom(request, env, corsHeaders) {
  const roomId = new URL(request.url).pathname.split('/')[3];

  const durableObjectId = env.STREAM_ROOM.idFromName(roomId);
  const room = env.STREAM_ROOM.get(durableObjectId);

  const result = await room.fetch(
    new Request('http://internal', {
      method: 'GET',
      body: JSON.stringify({ action: 'get_room_data' }),
    })
  );

  const roomData = await result.json();

  return new Response(JSON.stringify(roomData), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
