const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Create the database if it doesn't exist
    await prisma.$executeRaw`CREATE DATABASE IF NOT EXISTS befitoutfit;`;
    
    // Create the tables
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL
      );
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS auth_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        roleId INT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (roleId) REFERENCES roles(id)
      );
    `;
    
    // Insert default role if it doesn't exist
    await prisma.$executeRaw`
      INSERT IGNORE INTO roles (name) VALUES ('user');
    `;
    
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 