import express from 'express';
import cors from 'cors';
import { db } from './db/index.js';
import { pastes } from './db/schema.js';
import { count, eq, sql, ilike, or, gt, not, and, isNull } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { CreatePasteInput, Paste } from '@pastebin/shared';
import { CreatePasteSchema, SearchSchema, ViewPasteSchema } from '@pastebin/shared';

const app = express();

// 1. Configure CORS options
const corsOptions = {
  origin: `http://localhost:${process.env.VITE_PORT || '4613'}`,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Required if you plan to use Cookies/Sessions later
};

// 2. Apply middleware
app.use(cors(corsOptions));

// 3. Built-in body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. create new paste
app.post('/api/createPaste', async (req, res) => {
  try {
    const result = CreatePasteSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);

    const { title, content, visibility, expiresAt } = result.data;

    let nanoID = nanoid()
    const expiryMap = {
      '3m': sql`now() + interval '3 minutes'`,
      '1h': sql`now() + interval '1 hour'`,
      '1d': sql`now() + interval '1 day'`,
      '1w': sql`now() + interval '7 days'`,
      '1y': sql`now() + interval '1 year'`,
      'n': null,
    };


    // pre check use 2 db request instead of 1, 
    // might have race condition(same slug already insert between check and insert)

    // let result = await db.select().from(pastes).where(
    //   eq(pastes.slug, nanoID)
    // );
    // while (result.length > 0) {
    //   nanoID = nanoid()
    //   result = await db.select().from(pastes).where(
    //     eq(pastes.slug, nanoID)
    //   );
    // }

    const [newPaste] = await db.insert(pastes).values({
      slug: nanoID,
      title,
      content,
      visibility,
      expiresAt: expiryMap[expiresAt as keyof typeof expiryMap] || null,
      userId: null
    }).returning();

    res.status(200).json(newPaste);
  } catch (error) {
    console.error('DB Connection Error:', error);
    res.status(500).json({ status: 'error', message: 'Database unreachable' });
  }
});

//search by keyword in title and content
app.get('/api/search', async (req, res) => {
  try {
    const result = SearchSchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }
    const { keyword } = result.data;
    if (!keyword) {
      return res.status(400).json({ message: 'Keyword is required' });
    }
    const sqlTemplate = `%${keyword}%`

    const searchResult = await db.select().from(pastes).where(
      and(
        // or(
          ilike(pastes.title, sqlTemplate),
          // ilike(pastes.content, sqlTemplate)
        // ),
        eq(pastes.visibility, 'public'),
        or(
          isNull(pastes.expiresAt),
          gt(pastes.expiresAt, sql`now()`)
        )
      )
    )

    res.status(200).json(searchResult);
  } catch (error) {
    console.error('DB Connection Error:', error);
    res.status(500).json({ status: 'error', message: 'Database unreachable' });
  }
});

// show content of a paste
app.get('/api/viewPaste/:slug', async (req, res) => {
  try {
    const result = ViewPasteSchema.safeParse(req.params);

    if (!result.success)
      return res.status(400).json({ message: "Invalid paste identifier" });

    const { slug } = result.data

    const [pasteObj] = await db.select().from(pastes).where(
      and(
        eq(pastes.slug, slug), 
        or(
          gt(pastes.expiresAt, sql`now()`), 
          isNull(pastes.expiresAt)         
        )
      )
    )

    if (!pasteObj) return res.status(404).json({ message: "Paste not found" });

    res.status(200).json(pasteObj);
  } catch (error) {
    console.error('DB Connection Error:', error);
    res.status(500).json({ status: 'error', message: 'Database unreachable' });
  }
});

const PORT = process.env.VITE_API_PORT || '4614';
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});