// One server: serves the website and the GraphQL API (/graphql)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { createYoga, createSchema } = require('graphql-yoga');
const { GraphQLError } = require('graphql');
const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const html = fs.readFileSync(path.join(__dirname, 'index.html'));
const adminHtml = fs.readFileSync(path.join(__dirname, 'admin.html'));
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const fail = (message, code) => new GraphQLError(message, { extensions: { code } });
const str = (v) => (typeof v === 'string' ? v.trim() : '');

const sha = (v) => crypto.createHash('sha256').update(v).digest();
function requireAdmin(ctx) {
  const [scheme, token] = (ctx.request.headers.get('authorization') || '').split(' ');
  let pass = '';
  if (scheme === 'Basic' && token) {
    const decoded = Buffer.from(token, 'base64').toString();
    pass = decoded.slice(decoded.indexOf(':') + 1);
  }
  if (!ADMIN_PASSWORD || !crypto.timingSafeEqual(sha(pass), sha(ADMIN_PASSWORD))) {
    throw fail('Väärä salasana', 'UNAUTHORIZED');
  }
}

const COLS = `id, name, type, age, breed,
  fur_color AS "furColor", dark_color AS "darkColor", light_color AS "lightColor",
  bg_color AS "bgColor", ear_style AS "earStyle", description, needs, status`;

const typeDefs = /* GraphQL */ `
  type Animal {
    id: ID!
    name: String!
    type: String!
    age: String!
    breed: String!
    furColor: String!
    darkColor: String!
    lightColor: String!
    bgColor: String!
    earStyle: String!
    description: String!
    needs: [String!]!
    status: String!
  }
  input AdoptionInput {
    fullName: String!
    email: String!
    phone: String!
    message: String
  }
  type AdoptionResult {
    adoptionId: Int!
    animalName: String!
  }
  type AdoptionRecord {
    id: Int!
    animalId: ID!
    animalName: String!
    fullName: String!
    email: String!
    phone: String!
    message: String!
    createdAt: String!
  }
  type Query {
    adoptions: [AdoptionRecord!]!
    animals: [Animal!]!
    animal(id: ID!): Animal
  }
  type Mutation {
    adoptAnimal(id: ID!, input: AdoptionInput!): AdoptionResult!
  }
`;

const resolvers = {
  Query: {
    adoptions: async (_, __, ctx) => {
      requireAdmin(ctx);
      return (await pool.query(
        `SELECT a.id, a.animal_id AS "animalId", n.name AS "animalName", a.full_name AS "fullName",
                a.email, a.phone, a.message, a.created_at::text AS "createdAt"
         FROM adoptions a JOIN animals n ON n.id = a.animal_id
         ORDER BY a.created_at DESC`
      )).rows;
    },
    animals: async () => (await pool.query(`SELECT ${COLS} FROM animals ORDER BY sort_order`)).rows,
    animal: async (_, { id }) => (await pool.query(`SELECT ${COLS} FROM animals WHERE id = $1`, [id])).rows[0] || null,
  },
  Mutation: {
    adoptAnimal: async (_, { id, input }) => {
      const fullName = str(input.fullName), email = str(input.email), phone = str(input.phone), message = str(input.message);
      if (fullName.split(/\s+/).filter(Boolean).length < 2) throw fail('Kirjoita etu- ja sukunimi', 'BAD_USER_INPUT');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw fail('Virheellinen sähköpostiosoite', 'BAD_USER_INPUT');
      if (!/^\+?[\d\s-]{7,16}$/.test(phone)) throw fail('Virheellinen puhelinnumero', 'BAD_USER_INPUT');

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // Lock the row so two simultaneous applications cannot both succeed
        const { rows } = await client.query('SELECT name, status FROM animals WHERE id = $1 FOR UPDATE', [id]);
        if (!rows.length) throw fail('Eläintä ei löytynyt', 'NOT_FOUND');
        if (rows[0].status === 'adopted') throw fail(`${rows[0].name} on jo adoptoitu`, 'ALREADY_ADOPTED');
        const ins = await client.query(
          'INSERT INTO adoptions (animal_id, full_name, email, phone, message) VALUES ($1,$2,$3,$4,$5) RETURNING id',
          [id, fullName, email, phone, message]
        );
        await client.query("UPDATE animals SET status = 'adopted' WHERE id = $1", [id]);
        await client.query('COMMIT');
        return { adoptionId: ins.rows[0].id, animalName: rows[0].name };
      } catch (e) {
        await client.query('ROLLBACK').catch(() => {});
        if (e instanceof GraphQLError) throw e;
        console.error(e);
        throw fail('Hakemuksen tallennus epäonnistui', 'INTERNAL');
      } finally {
        client.release();
      }
    },
  },
};

const yoga = createYoga({ schema: createSchema({ typeDefs, resolvers }), graphqlEndpoint: '/graphql' });

http
  .createServer((req, res) => {
    if (req.url.split('?')[0] === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }
    if (req.url.split('?')[0] === '/admin') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(adminHtml);
    }
    yoga(req, res);
  })
  .listen(3000, () => console.log('http://localhost:3000'));
