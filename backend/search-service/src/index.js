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
  const { lat, lon, radius = '50km' } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat or lon parameters' });
  }

  try {
    const result = await client.search({
      index: 'theatres',
      body: {
        query: {
          bool: {
            must: {
              match_all: {}
            },
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
      }
    });

    const theatres = result.body.hits.hits.map(hit => ({
      id: hit._source.id,
      name: hit._source.name,
      location: hit._source.location,
      distance_km: hit.sort[0]
    }));

    res.json(theatres);
  } catch (error) {
    console.error('[Search Service] Error querying elasticsearch', error);
    res.status(500).json({ error: 'Failed to search theatres' });
  }
});

app.listen(PORT, () => {
  console.log(`[Search Service] Running on port ${PORT}`);
});
