import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.maintenanceRequest.deleteMany();
  // Clear data in correct order
  await prisma.maintenanceRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.sensorData.deleteMany();
  await prisma.house.deleteMany();
  await prisma.landAcquisition.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const users = [];
  // Admins
  users.push({ name: 'Admin User', email: 'admin@example.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'admin' });
  users.push({ name: 'Admin 2', email: 'admin2@example.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'admin' });
  // Housing manager
  users.push({ name: 'Housing Manager', email: 'manager@example.com', password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'housing_manager' });
  // Tenant users (10 + 10 more)
  const tenantNames = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Davis', 'Diana Evans', 'Eve Wilson', 'Frank Miller', 'Grace Lee', 'Henry Garcia', 'Ivy Martinez', 'Jack Rodriguez', 'Kelly Lopez', 'Leo Hernandez', 'Mia Gonzalez', 'Noah Perez', 'Olivia Ramirez', 'Paul Sanchez', 'Quinn Torres', 'Rose Flores'];
  for (let i = 0; i < 20; i++) {
    users.push({ name: tenantNames[i], email: `tenant${i+1}@example.com`, password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'tenant' });
  }
  const createdUsers = await prisma.user.createMany({ data: users });
  console.log(`Created ${createdUsers.count} users`);

  // Wait for users IDs
  const allUsers = await prisma.user.findMany({ select: { id: true, role: true } });
  const tenantUserIds = allUsers.filter(u => u.role === 'tenant').map(u => u.id);
  const managerUserId = allUsers.find(u => u.role === 'housing_manager')?.id;

  // Create 30 houses (10 available, 20 assigned)
  const houseData = [];
  const locations = ['Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba', 'Karonga'];
  for (let i = 1; i <= 30; i++) {
    houseData.push({
      address: `House ${i}, Area ${i % 10 + 1}`,
      location: locations[Math.floor(i % locations.length)],
      status: i > 20 ? 'available' : 'occupied',
      latitude: -13.96 + (Math.random() - 0.5) * 0.1,
      longitude: 33.77 + (Math.random() - 0.5) * 0.1,
      tenantId: null
    });
  }
  const houses = await prisma.house.createMany({ data: houseData });
  console.log(`Created ${houses.count} houses`);

  const allHouses = await prisma.house.findMany({ select: { id: true } });
  const availableHouseIds = allHouses.slice(20).map(h => h.id); // Last 10 available
  const occupiedHouseIds = allHouses.slice(0, 20).map(h => h.id);

  // Create 10 tenants (varying houses, some multiple tenants per house)
  const tenantData = [];
  for (let i = 0; i < 10; i++) {
    const houseId = occupiedHouseIds[Math.floor(Math.random() * occupiedHouseIds.length)];
    const userId = tenantUserIds[i];
    tenantData.push({
      name: `Tenant ${i+1}`,
      rentStatus: ['pending', 'paid', 'overdue'][Math.floor(Math.random() * 3)],
      userId,
      houseId
    });
  }
  const tenants = await prisma.tenant.createMany({ data: tenantData });
  console.log(`Created ${tenants.count} tenants`);

  // Sample payments
  const payments = [];
  for (let i = 0; i < 5; i++) {
    payments.push({
      amount: 50000 + Math.random() * 50000,
      tenantId: tenantUserIds[i % 10] || 1,
      method: 'PayChangu',
      status: 'completed'
    });
  }
  await prisma.payment.createMany({ data: payments });

  // Sample maintenance
  const maintenance = [];
  for (let i = 0; i < 3; i++) {
    maintenance.push({
      description: `Fix leak in kitchen ${i}`,
      status: ['pending', 'approved'][Math.floor(Math.random() * 2)],
      tenantId: tenantUserIds[i % 10] || 1,
      houseId: occupiedHouseIds[i % 20] || 1
    });
  }
  await prisma.maintenanceRequest.createMany({ data: maintenance });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

