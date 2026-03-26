import { Router, Request, Response } from 'express';

const router = Router();

const CB5ENY_CHANNEL_ID = 'UCdBnwOtiUFCmgPwWYf2EqjQ';
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CB5ENY_CHANNEL_ID}`;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedVideo {
  videoId: string;
  title: string;
  publishedAt: string;
  fetchedAt: number;
}

let cache: CachedVideo | null = null;

/**
 * @swagger
 * /api/youtube/latest:
 *   get:
 *     summary: Get latest CB5ENY YouTube video
 *     tags: [YouTube]
 *     responses:
 *       200:
 *         description: Latest video info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 videoId:
 *                   type: string
 *                 title:
 *                   type: string
 *                 publishedAt:
 *                   type: string
 */
router.get('/latest', async (_req: Request, res: Response) => {
  try {
    // Return cached value if fresh
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
      return res.json({
        videoId: cache.videoId,
        title: cache.title,
        publishedAt: cache.publishedAt,
      });
    }

    const response = await fetch(RSS_URL);
    if (!response.ok) {
      throw new Error(`YouTube RSS fetch failed: ${response.status}`);
    }

    const xml = await response.text();

    // Parse the first <entry> from the Atom feed using regex (avoids XML parser dependency)
    const videoIdMatch = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = xml.match(/<entry>[\s\S]*?<title>([^<]+)<\/title>/);
    const publishedMatch = xml.match(/<entry>[\s\S]*?<published>([^<]+)<\/published>/);

    if (!videoIdMatch) {
      return res.status(404).json({ error: 'No videos found in feed.' });
    }

    const videoId = videoIdMatch[1];
    const title = titleMatch ? titleMatch[1] : 'CB5 ENY Video';
    const publishedAt = publishedMatch ? publishedMatch[1] : new Date().toISOString();

    cache = { videoId, title, publishedAt, fetchedAt: Date.now() };

    res.json({ videoId, title, publishedAt });
  } catch (error) {
    console.error('Error fetching YouTube feed:', error);
    // Return stale cache if available
    if (cache) {
      return res.json({
        videoId: cache.videoId,
        title: cache.title,
        publishedAt: cache.publishedAt,
      });
    }
    res.status(500).json({ error: 'Failed to fetch latest video' });
  }
});

export default router;
