import knex from 'knex';

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './database.sqlite',
  },
  useNullAsDefault: true,
});

async function initDB() {
  // USERS
  const usersExists = await db.schema.hasTable('users');
  if (!usersExists) {
    await db.schema.createTable('users', (table) => {
      table.increments('id');
      table.string('discord_id').unique().notNullable();
      table.string('discord_email').notNullable();
      table.string('ptero_id').notNullable();
      table.string('ptero_username').notNullable();
      table.integer('coins').defaultTo(0);
      table.boolean('is_admin').defaultTo(false);
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('✅ users table created');
  } else {
    const hasAdmin = await db.schema.hasColumn('users', 'is_admin');
    if (!hasAdmin) {
      await db.schema.alterTable('users', (table) => {
        table.boolean('is_admin').defaultTo(false);
      });
      console.log('✅ users table updated: is_admin column added');
    }
  }

  // SERVERS
  const serversExists = await db.schema.hasTable('servers');
  if (!serversExists) {
    await db.schema.createTable('servers', (table) => {
      table.integer('id').primary(); // use Pterodactyl server ID
      table.string('uuid').notNullable();
      table.string('identifier').notNullable();
      table.string('name').notNullable();
      table.integer('cpu');
      table.integer('memory');
      table.integer('disk');
      table.integer('ports');
      table.integer('databases');
      table.integer('backups');
      table.integer('user_id').notNullable(); // Ptero user ID
      table.timestamp('expires_at');
      table.integer('renewal_cost');
    });
    console.log('✅ servers table created');
  }

  // EGGS
  const eggsExists = await db.schema.hasTable('eggs');
  if (!eggsExists) {
    await db.schema.createTable('eggs', (table) => {
      table.integer('egg_id').primary();
      table.string('name').notNullable();
      table.string('nest').notNullable();
      table.string('docker_image');
      table.string('startup');
      table.text('environment');
    });
    console.log('✅ eggs table created');
  }

  // LOCATIONS
  const locationsExists = await db.schema.hasTable('locations');
  if (!locationsExists) {
    await db.schema.createTable('locations', (table) => {
      table.integer('id').primary(); // use real Pterodactyl location ID
      table.string('name').notNullable();
    });
    console.log('✅ locations table created');
  }
}

initDB();
export default db;
