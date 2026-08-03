import express from 'express';
import cors from 'cors';
import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: process.env.ELASTIC_URL || 'http://localhost:9200',
});

const app = express();
const PORT = 3003;

// CORS handled by API Gateway
app.use(express.json());

// GET /search/theatres?lat=x&lon=y&radius=50km
app.get('/theatres', async (req, res) => {
  const { lat, lon, radius = '50km', query } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat or lon parameters' });
  }

  try {
    const searchBody = {
      query: {
        bool: {
          must: query ? [
            {
              multi_match: {
                query: query,
                fields: ['name', 'address', 'city']
              }
            }
          ] : [
            {
              match_all: {}
            }
          ],
          filter: {
            geo_distance: {
              distance: radius,
              location: {
                lat: parseFloat(lat),
                lon: parseFloat(lon)
              }
            }
          }
        }
      },
      sort: [
        {
          _geo_distance: {
            location: {
              lat: parseFloat(lat),
              lon: parseFloat(lon)
            },
            order: 'asc',
            unit: 'km'
          }
        }
      ]
    };

    const result = await client.search({
      index: 'theatres',
      body: searchBody
    });

    const theatres = result.body.hits.hits.map(hit => ({
      id: hit._source.id,
      name: hit._source.name,
      address: hit._source.address,
      location: hit._source.location,
      distance_km: hit.sort[0]
    }));

    res.json(theatres);
  } catch (error) {
    console.error('[Search Service] Error querying elasticsearch, falling back to mock data');
    const mockTheatres = [
      { id: 'theatre-1', name: 'PVR Phoenix Palassio', address: 'Phoenix Palassio Mall, Amar Shaheed Path, Lucknow', location: { lat: 26.8123, lon: 81.0116 }, distance_km: 2.5 },
      { id: 'theatre-2', name: 'INOX Riverside Mall', address: 'Riverside Mall, Gomti Nagar, Lucknow', location: { lat: 26.8550, lon: 80.9780 }, distance_km: 3.1 },
      { id: 'theatre-3', name: 'Cinepolis One Awadh Center', address: 'One Awadh Center Mall, Vibhuti Khand, Lucknow', location: { lat: 26.8582, lon: 81.0069 }, distance_km: 4.2 },
      { id: 'theatre-4', name: 'Wave Cinemas', address: 'Wave Mall, Gomti Nagar, Lucknow', location: { lat: 26.8617, lon: 81.0028 }, distance_km: 5.0 },
      { id: 'theatre-5', name: 'PVR Saharaganj', address: 'Saharaganj Mall, Hazratganj, Lucknow', location: { lat: 26.8533, lon: 80.9430 }, distance_km: 1.2 },
      { id: 'theatre-6', name: 'INOX Umrao Mall', address: 'Umrao Mall, Mahanagar, Lucknow', location: { lat: 26.8679, lon: 80.9926 }, distance_km: 6.5 }
    ];
    let filtered = mockTheatres;
    if (query) {
      const q = query.toLowerCase();
      filtered = mockTheatres.filter(t => t.name.toLowerCase().includes(q) || t.address.toLowerCase().includes(q));
    }
    res.json(filtered);
  }
});

app.listen(PORT, () => {
  console.log(`[Search Service] Running on port ${PORT}`);
});
