import http from 'node:http';
import app from './app';
import { pool } from './config';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const server = http.createServer(app);

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Prueba de conexión a PostgreSQL
  console.log('🔄 Intentando conectar a PostgreSQL...');
  
  try {
    const result = await pool.query('SELECT NOW() as now, version() as version');
    console.log('✅ Conexión exitosa a PostgreSQL');
    console.log('   Fecha/hora actual:', result.rows[0].now);
    console.log('   Versión:', result.rows[0].version.split(',')[0]);
  } catch (err) {
    console.error('❌ Error de conexión a PostgreSQL:');
    if (err instanceof Error) {
      console.error('   Mensaje:', err.message);
      console.error('   Verifica que:');
      console.error('   1. La base de datos esté ejecutándose');
      console.error('   2. Las credenciales en DATABASE_URL sean correctas');
      console.error('   3. El host/puerto sean accesibles desde tu máquina');
    }
  }
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
