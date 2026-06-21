const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:54322/postgres' });
c.connect()
  .then(() => c.query("SELECT prosrc FROM pg_catalog.pg_proc WHERE proname = 'create_pending_checkout'"))
  .then(r => { console.log(r.rows[0].prosrc); c.end(); })
  .catch(console.error);
