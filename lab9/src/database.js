const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { hashPassword, verifyPassword } = require('./passwords');

const SAMPLE_DESTINATIONS = [
  ['Paris', 'France', 'Classic city break with museums, monuments, cafes, and walkable neighborhoods.', 'Eiffel Tower, Louvre Museum, Montmartre, Notre-Dame area', 165.0],
  ['Barcelona', 'Spain', 'Mediterranean destination with beaches, distinctive architecture, and lively food markets.', 'Sagrada Familia, Park Guell, La Rambla, Barceloneta Beach', 135.0],
  ['Brasov', 'Romania', 'Mountain city close to castles, hiking trails, medieval squares, and scenic viewpoints.', 'Council Square, Tampa Mountain, Bran Castle, Rasnov Fortress', 75.0],
  ['Kyoto', 'Japan', 'Historic destination known for temples, gardens, tea culture, and traditional streets.', 'Fushimi Inari Shrine, Kiyomizu-dera, Arashiyama Bamboo Grove, Gion', 145.0],
  ['Rome', 'Italy', 'Ancient city with major archaeological sites, churches, piazzas, and excellent food.', 'Colosseum, Roman Forum, Vatican Museums, Trevi Fountain', 150.0],
  ['Cluj-Napoca', 'Romania', 'Student city with cultural events, parks, cafes, and quick access to Transylvanian trips.', 'Central Park, Botanical Garden, Union Square, Turda Salt Mine', 65.0],
];

function formatDestination(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    location_name: row.location_name,
    country_name: row.country_name,
    description: row.description,
    tourist_targets: row.tourist_targets,
    estimated_cost_per_day: Number(row.estimated_cost_per_day).toFixed(2),
  };
}

function createRepository(databasePath, seedUser) {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const database = new DatabaseSync(databasePath);
  database.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS app_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS destinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_name TEXT NOT NULL,
      country_name TEXT NOT NULL,
      description TEXT NOT NULL,
      tourist_targets TEXT NOT NULL,
      estimated_cost_per_day REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_destinations_country ON destinations(country_name);
    CREATE INDEX IF NOT EXISTS idx_destinations_location ON destinations(location_name);
  `);

  const existingUser = database
    .prepare('SELECT id FROM app_users WHERE username = ?')
    .get(seedUser.username);

  if (!existingUser) {
    database
      .prepare('INSERT INTO app_users (username, password_hash) VALUES (?, ?)')
      .run(seedUser.username, hashPassword(seedUser.password));
  }

  const totalDestinations = database
    .prepare('SELECT COUNT(*) AS total FROM destinations')
    .get().total;

  if (totalDestinations === 0) {
    const insertDestination = database.prepare(`
      INSERT INTO destinations (
        location_name,
        country_name,
        description,
        tourist_targets,
        estimated_cost_per_day
      ) VALUES (?, ?, ?, ?, ?)
    `);

    for (const destination of SAMPLE_DESTINATIONS) {
      insertDestination.run(...destination);
    }
  }

  return {
    authenticate(username, password) {
      const row = database
        .prepare('SELECT id, username, password_hash FROM app_users WHERE username = ? LIMIT 1')
        .get(username);

      if (!row || !verifyPassword(password, row.password_hash)) {
        return null;
      }

      return {
        id: row.id,
        username: row.username,
      };
    },

    getCountries() {
      return database
        .prepare(`
          SELECT country_name, COUNT(*) AS destination_count
          FROM destinations
          GROUP BY country_name
          ORDER BY country_name ASC
        `)
        .all()
        .map((row) => ({
          country_name: row.country_name,
          destination_count: row.destination_count,
        }));
    },

    getDestinations(country, page, perPage) {
      const normalizedCountry = String(country ?? '').trim();
      const hasCountry = normalizedCountry.length > 0;
      const countRow = hasCountry
        ? database
            .prepare('SELECT COUNT(*) AS total FROM destinations WHERE country_name = ?')
            .get(normalizedCountry)
        : database
            .prepare('SELECT COUNT(*) AS total FROM destinations')
            .get();

      const total = Number(countRow.total ?? 0);
      const totalPages = Math.max(1, Math.ceil(total / perPage));
      const safePage = Math.min(Math.max(page, 1), totalPages);
      const offset = (safePage - 1) * perPage;

      const rows = hasCountry
        ? database
            .prepare(`
              SELECT id, location_name, country_name, description, tourist_targets, estimated_cost_per_day
              FROM destinations
              WHERE country_name = ?
              ORDER BY country_name ASC, location_name ASC
              LIMIT ? OFFSET ?
            `)
            .all(normalizedCountry, perPage, offset)
        : database
            .prepare(`
              SELECT id, location_name, country_name, description, tourist_targets, estimated_cost_per_day
              FROM destinations
              ORDER BY country_name ASC, location_name ASC
              LIMIT ? OFFSET ?
            `)
            .all(perPage, offset);

      return {
        destinations: rows.map(formatDestination),
        total,
        page: safePage,
        perPage,
        totalPages,
      };
    },

    findDestination(id) {
      const row = database
        .prepare(`
          SELECT id, location_name, country_name, description, tourist_targets, estimated_cost_per_day
          FROM destinations
          WHERE id = ?
          LIMIT 1
        `)
        .get(id);

      return formatDestination(row);
    },

    createDestination(destination) {
      const result = database
        .prepare(`
          INSERT INTO destinations (
            location_name,
            country_name,
            description,
            tourist_targets,
            estimated_cost_per_day
          ) VALUES (?, ?, ?, ?, ?)
        `)
        .run(
          destination.location_name,
          destination.country_name,
          destination.description,
          destination.tourist_targets,
          Number(destination.estimated_cost_per_day),
        );

      return Number(result.lastInsertRowid);
    },

    updateDestination(id, destination) {
      const result = database
        .prepare(`
          UPDATE destinations
          SET location_name = ?,
              country_name = ?,
              description = ?,
              tourist_targets = ?,
              estimated_cost_per_day = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .run(
          destination.location_name,
          destination.country_name,
          destination.description,
          destination.tourist_targets,
          Number(destination.estimated_cost_per_day),
          id,
        );

      return result.changes > 0;
    },

    deleteDestination(id) {
      const result = database
        .prepare('DELETE FROM destinations WHERE id = ?')
        .run(id);

      return result.changes > 0;
    },
  };
}

module.exports = {
  createRepository,
};
