import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear profesionales
  const profesional1 = await prisma.profesional.create({
    data: {
      firstName: 'Carlos',
      lastName: 'Muñoz Soto',
      rut: '12345678-9',
      email: 'carlos.munoz@centro.cl',
      phone: '+56912345678',
      especialidad: 'Traumatología',
      color: '#3b82f6',
    },
  });

  const profesional2 = await prisma.profesional.create({
    data: {
      firstName: 'María',
      lastName: 'González Pérez',
      rut: '11222333-4',
      email: 'maria.gonzalez@centro.cl',
      phone: '+56987654321',
      especialidad: 'Deportiva',
      color: '#22c55e',
    },
  });

  console.log('✅ Profesionales creados');

  // Crear servicios
  const servicio1 = await prisma.servicio.create({
    data: {
      codigo: 'KT-001',
      nombre: 'Kinesiología Traumatológica',
      descripcion: 'Sesión de kinesiología traumatológica',
      categoria: 'KINESIOLOGIA',
      precio: 30000,
      duracionMinutos: 30,
    },
  });

  const servicio2 = await prisma.servicio.create({
    data: {
      codigo: 'KD-001',
      nombre: 'Kinesiología Deportiva',
      descripcion: 'Sesión de kinesiología deportiva',
      categoria: 'KINESIOLOGIA',
      precio: 35000,
      duracionMinutos: 45,
    },
  });

  const servicio3 = await prisma.servicio.create({
    data: {
      codigo: 'RH-001',
      nombre: 'Rehabilitación',
      descripcion: 'Sesión de rehabilitación',
      categoria: 'KINESIOLOGIA',
      precio: 28000,
      duracionMinutos: 30,
    },
  });

  const servicio4 = await prisma.servicio.create({
    data: {
      codigo: 'ENT-001',
      nombre: 'Entrenamiento Personal',
      descripcion: 'Sesión de entrenamiento personalizado',
      categoria: 'ENTRENAMIENTO',
      precio: 25000,
      duracionMinutos: 60,
    },
  });

  const servicio5 = await prisma.servicio.create({
    data: {
      codigo: 'EVA-001',
      nombre: 'Evaluación Inicial',
      descripcion: 'Evaluación integral del paciente',
      categoria: 'EVALUACION',
      precio: 40000,
      duracionMinutos: 60,
    },
  });

  console.log('✅ Servicios creados');

  // Crear precios personalizados por profesional
  await prisma.precioServicioProfesional.create({
    data: {
      servicioId: servicio1.id,
      profesionalId: profesional1.id,
      precio: 32000, // Carlos cobra más por su experiencia
    },
  });

  await prisma.precioServicioProfesional.create({
    data: {
      servicioId: servicio4.id,
      profesionalId: profesional2.id,
      precio: 28000, // María cobra más por entrenamiento
    },
  });

  console.log('✅ Precios personalizados creados');

  // Crear productos
  const producto1 = await prisma.producto.create({
    data: {
      codigo: 'PROD-001',
      nombre: 'Banda Elástica Resistencia Media',
      descripcion: 'Banda elástica para ejercicios de rehabilitación',
      categoria: 'Accesorios',
      precio: 8000,
      costo: 4000,
      stock: 15,
      stockMinimo: 5,
    },
  });

  const producto2 = await prisma.producto.create({
    data: {
      codigo: 'PROD-002',
      nombre: 'Pelota de Pilates 65cm',
      descripcion: 'Pelota para ejercicios de estabilidad',
      categoria: 'Accesorios',
      precio: 15000,
      costo: 8000,
      stock: 8,
      stockMinimo: 3,
    },
  });

  const producto3 = await prisma.producto.create({
    data: {
      codigo: 'PROD-003',
      nombre: 'Crema Antiinflamatoria',
      descripcion: 'Crema para alivio muscular',
      categoria: 'Productos',
      precio: 12000,
      costo: 6500,
      stock: 20,
      stockMinimo: 5,
    },
  });

  console.log('✅ Productos creados');

  // Crear pacientes
  const paciente1 = await prisma.paciente.create({
    data: {
      firstName: 'Juan',
      lastName: 'Pérez López',
      rut: '15666777-8',
      email: 'juan.perez@email.com',
      phone: '+56911111111',
      birthDate: new Date('1985-03-15'),
      gender: 'M',
      address: 'Av. Providencia 1234',
      comuna: 'Providencia',
      ciudad: 'Santiago',
      prevision: 'FONASA',
    },
  });

  const paciente2 = await prisma.paciente.create({
    data: {
      firstName: 'Ana',
      lastName: 'López Silva',
      rut: '16777888-9',
      email: 'ana.lopez@email.com',
      phone: '+56922222222',
      birthDate: new Date('1990-07-22'),
      gender: 'F',
      address: 'Los Leones 567',
      comuna: 'Providencia',
      ciudad: 'Santiago',
      prevision: 'Isapre Banmédica',
    },
  });

  const paciente3 = await prisma.paciente.create({
    data: {
      firstName: 'Pedro',
      lastName: 'Soto Ramírez',
      rut: '17888999-0',
      email: 'pedro.soto@email.com',
      phone: '+56933333333',
      birthDate: new Date('1978-11-30'),
      gender: 'M',
      address: 'Manuel Montt 890',
      comuna: 'Ñuñoa',
      ciudad: 'Santiago',
      prevision: 'FONASA',
    },
  });

  console.log('✅ Pacientes creados');

  // Crear sesiones de ejemplo
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  const antesAyer = new Date(hoy);
  antesAyer.setDate(antesAyer.getDate() - 2);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  // Sesión realizada y pagada
  const sesion1 = await prisma.sesion.create({
    data: {
      pacienteId: paciente1.id,
      profesionalId: profesional1.id,
      servicioId: servicio1.id,
      fechaHora: new Date(antesAyer.setHours(10, 0, 0, 0)),
      duracionMinutos: 30,
      precioBase: 30000,
      descuento: 0,
      precioFinal: 30000,
      estadoAgenda: 'CONFIRMADA',
      estadoAtencion: 'REALIZADA',
      estadoPago: 'PAGADA',
      montoPagado: 30000,
      motivoConsulta: 'Dolor lumbar',
      diagnostico: 'Lumbalgia mecánica',
    },
  });

  // Sesión realizada sin pago
  const sesion2 = await prisma.sesion.create({
    data: {
      pacienteId: paciente1.id,
      profesionalId: profesional1.id,
      servicioId: servicio1.id,
      fechaHora: new Date(ayer.setHours(10, 0, 0, 0)),
      duracionMinutos: 30,
      precioBase: 30000,
      descuento: 0,
      precioFinal: 30000,
      estadoAgenda: 'CONFIRMADA',
      estadoAtencion: 'REALIZADA',
      estadoPago: 'NO_PAGADA',
      montoPagado: 0,
      motivoConsulta: 'Control lumbalgia',
    },
  });

  // Sesión agendada para hoy
  const sesion3 = await prisma.sesion.create({
    data: {
      pacienteId: paciente2.id,
      profesionalId: profesional2.id,
      servicioId: servicio2.id,
      fechaHora: new Date(hoy.setHours(11, 0, 0, 0)),
      duracionMinutos: 45,
      precioBase: 35000,
      descuento: 0,
      precioFinal: 35000,
      estadoAgenda: 'CONFIRMADA',
      estadoAtencion: 'PENDIENTE',
      estadoPago: 'NO_PAGADA',
      montoPagado: 0,
      motivoConsulta: 'Rehabilitación rodilla',
    },
  });

  // Sesión agendada para mañana
  await prisma.sesion.create({
    data: {
      pacienteId: paciente3.id,
      profesionalId: profesional1.id,
      servicioId: servicio3.id,
      fechaHora: new Date(manana.setHours(9, 0, 0, 0)),
      duracionMinutos: 30,
      precioBase: 28000,
      descuento: 0,
      precioFinal: 28000,
      estadoAgenda: 'AGENDADA',
      estadoAtencion: 'PENDIENTE',
      estadoPago: 'NO_PAGADA',
      montoPagado: 0,
      motivoConsulta: 'Cervicalgia',
    },
  });

  console.log('✅ Sesiones creadas');

  // Crear pago para sesión 1
  const pago1 = await prisma.pago.create({
    data: {
      pacienteId: paciente1.id,
      monto: 30000,
      montoAplicado: 30000,
      saldoDisponible: 0,
      metodoPago: 'TRANSFERENCIA',
      referencia: 'TRF-001',
      tipoPago: 'SESION_INDIVIDUAL',
      descripcion: 'Pago sesión 1',
      fechaPago: antesAyer,
    },
  });

  await prisma.pagoSesion.create({
    data: {
      pagoId: pago1.id,
      sesionId: sesion1.id,
      montoAplicado: 30000,
    },
  });

  // Crear pago anticipado para paciente 2
  await prisma.pago.create({
    data: {
      pacienteId: paciente2.id,
      monto: 100000,
      montoAplicado: 0,
      saldoDisponible: 100000,
      metodoPago: 'REDCOMPRA_CREDITO',
      referencia: 'VISA-001',
      tipoPago: 'ANTICIPO',
      descripcion: 'Pago anticipado 3 sesiones',
      fechaPago: ayer,
    },
  });

  console.log('✅ Pagos creados');

  // Actualizar saldos de pacientes
  await prisma.paciente.update({
    where: { id: paciente1.id },
    data: { saldoPendiente: 30000 }, // Sesión 2 sin pagar
  });

  await prisma.paciente.update({
    where: { id: paciente2.id },
    data: { saldoAFavor: 100000 }, // Anticipo
  });

  console.log('✅ Saldos actualizados');

  console.log('');
  console.log('🎉 Seed completado!');
  console.log('');
  console.log('Datos creados:');
  console.log(`  - 2 profesionales`);
  console.log(`  - 5 servicios`);
  console.log(`  - 2 precios personalizados`);
  console.log(`  - 3 productos`);
  console.log(`  - 3 pacientes`);
  console.log(`  - 4 sesiones`);
  console.log(`  - 2 pagos`);
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
