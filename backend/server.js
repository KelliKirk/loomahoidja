const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 3001;

sequelize.sync({ force: false }).then(() => {
  console.log('Database connected');
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}).catch(err => {
  console.error('Error connecting database', err);
  process.exit(1);
});