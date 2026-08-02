import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: process.env.ELASTIC_URL || 'http://localhost:9200',
});

async function init() {
  console.log('[Elastic Init] Starting...');
  const indexName = 'theatres';

  try {
    try {
      await client.indices.delete({ index: indexName });
    } catch (err) {
      if (err.meta && err.meta.statusCode !== 404) throw err;
    }

    await client.indices.create({
      index: indexName,
      body: {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: { type: 'text' },
            address: { type: 'text' },
            location: { type: 'geo_point' },
          },
        },
      },
    });

    console.log(`[Elastic Init] Created index '${indexName}' with geo_point mapping.`);

    // Mock data for Lucknow theatres
    const theatres = [
      { id: 'theatre-1', name: 'PVR Phoenix Palassio', address: 'Phoenix Palassio Mall, Amar Shaheed Path, Lucknow', location: { lat: 26.8123, lon: 81.0116 } },
      { id: 'theatre-2', name: 'INOX Riverside Mall', address: 'Riverside Mall, Gomti Nagar, Lucknow', location: { lat: 26.8550, lon: 80.9780 } },
      { id: 'theatre-3', name: 'Cinepolis One Awadh Center', address: 'One Awadh Center Mall, Vibhuti Khand, Lucknow', location: { lat: 26.8582, lon: 81.0069 } },
      { id: 'theatre-4', name: 'Wave Cinemas', address: 'Wave Mall, Gomti Nagar, Lucknow', location: { lat: 26.8617, lon: 81.0028 } },
      { id: 'theatre-5', name: 'PVR Saharaganj', address: 'Saharaganj Mall, Hazratganj, Lucknow', location: { lat: 26.8533, lon: 80.9430 } },
      { id: 'theatre-6', name: 'INOX Umrao Mall', address: 'Umrao Mall, Mahanagar, Lucknow', location: { lat: 26.8679, lon: 80.9926 } }
    ];

    for (const t of theatres) {
      await client.index({
        index: indexName,
        id: t.id,
        body: t,
      });
    }
    
    // Refresh to make them searchable immediately
    await client.indices.refresh({ index: indexName });

    console.log('[Elastic Init] Mock data inserted successfully.');
  } catch (error) {
    console.error('[Elastic Init] Error:', error);
  }
}

init();
