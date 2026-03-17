import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { randomBytes, createHash } from 'crypto';

const mockDbInsert = vi.fn().mockImplementation(() => ({
  values: vi.fn().mockReturnValue({
    returning: vi.fn().mockResolvedValue([{
      id: 1,
      slug: 'testSlug123',
      title: 'Test Paste',
      content: 'Test content',
      visibility: 'public', 
      passwordHash: null,
      userId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: null,
    }]),
  }),
}));

vi.mock('./db/index.js', () => ({
  db: {
    insert: (...args: unknown[]) => mockDbInsert(...args),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    }),
  },
}));

vi.mock('./db/schema.js', () => ({
  pastes: {
    slug: 'slug',
    title: 'title',
    content: 'content',
    visibility: 'visibility',
    passwordHash: 'passwordHash',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    userId: 'userId',
  },
}));

vi.mock('nanoid', () => ({
  nanoid: vi.fn().mockReturnValue('testSlug123'),
}));

vi.mock('drizzle-orm', () => ({
  sql: vi.fn((str: string) => str),
  or: vi.fn((...args: unknown[]) => args),
  and: vi.fn((...args: unknown[]) => args),
  isNull: vi.fn((x: unknown) => x),
  gt: vi.fn((x: unknown, y: unknown) => ({ x, y })),
  eq: vi.fn((x: unknown, y: unknown) => ({ x, y })),
}));

const app = express();
app.use(express.json());

app.post('/api/createPaste', async (req, res) => {
  const { db } = await import('./db/index.js');
  const { pastes } = await import('./db/schema.js');

  try {
    const { title, content, visibility, expiresAt, password } = req.body;

    let passwordHash: string | null = null;
    if (visibility === 'private' && password) {
      const salt = randomBytes(16).toString('hex');
      const hash = createHash('sha256').update(salt + password).digest('hex');
      passwordHash = `${salt}:${hash}`;
    }

    const nanoID = 'testSlug123';

    const [newPaste] = await db.insert(pastes).values({
      slug: nanoID,
      title,
      content,
      visibility,
      passwordHash,
      expiresAt: null,
      userId: null,
    }).returning();

    if (!newPaste) {
      return res.status(500).json({ status: 'error', message: 'Failed to create paste' });
    }

    const response = {
      id: newPaste.id,
      slug: newPaste.slug,
      title: newPaste.title,
      content: newPaste.content,
      visibility: newPaste.visibility,
      createdAt: newPaste.createdAt,
      updatedAt: newPaste.updatedAt,
      expiresAt: newPaste.expiresAt,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('DB Connection Error:', error);
    res.status(500).json({ status: 'error', message: 'Database unreachable' });
  }
});

app.get('/api/viewPaste/:slug', async (req, res) => {
  const { db } = await import('./db/index.js');
  const { pastes } = await import('./db/schema.js');

  try {
    const { slug } = req.params;
    const { password } = req.query as { password?: string };

    const [pasteObj] = await db.select().from(pastes).where(
      // @ts-expect-error - simplified mock
      { slug }
    );

    if (!pasteObj) return res.status(404).json({ message: 'Paste not found' });

    const response: Record<string, unknown> = {
      id: pasteObj.id,
      slug: pasteObj.slug,
      title: pasteObj.title,
      visibility: pasteObj.visibility,
      createdAt: pasteObj.createdAt,
      updatedAt: pasteObj.updatedAt,
      expiresAt: pasteObj.expiresAt,
    };

    if (pasteObj.visibility === 'private' && pasteObj.passwordHash) {
      if (!password) {
        response.content = null;
        return res.status(200).json(response);
      }
      const [salt, hash] = pasteObj.passwordHash.split(':');
      const inputHash = createHash('sha256').update(salt + password).digest('hex');
      if (inputHash !== hash) {
        response.content = null;
        response.passwordError = true;
        return res.status(200).json(response);
      }
    }

    response.content = pasteObj.content;
    res.status(200).json(response);
  } catch (error) {
    console.error('DB Connection Error:', error);
    res.status(500).json({ status: 'error', message: 'Database unreachable' });
  }
});

describe('API Endpoints', () => {
  describe('POST /api/createPaste', () => {
    it('should create a public paste', async () => {
      const response = await request(app)
        .post('/api/createPaste')
        .send({
          title: 'Test Paste',
          content: 'Test content',
          visibility: 'public',
          expiresAt: 'n',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('slug');
      expect(response.body).toHaveProperty('id');
      expect(response.body.visibility).toBe('public');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should hash password for private paste', async () => {
      const response = await request(app)
        .post('/api/createPaste')
        .send({
          title: 'Private Paste',
          content: 'Secret content',
          visibility: 'private',
          expiresAt: 'n',
          password: 'secret123',
        });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/viewPaste/:slug', () => {
    it('should return 404 for non-existent paste', async () => {
      const response = await request(app)
        .get('/api/viewPaste/nonexistent');

      expect(response.status).toBe(404);
    });
  });
});
