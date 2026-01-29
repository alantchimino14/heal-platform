const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
        Header, Footer, AlignmentType, PageBreak, LevelFormat, BorderStyle,
        WidthType, ShadingType, VerticalAlign, HeadingLevel, PageNumber } = require('docx');
const fs = require('fs');
const path = require('path');

// Brand colors
const PRIMARY_COLOR = "5f7da1";
const DARK_COLOR = "3d556f";

// Screenshots directory
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

// Helper to load image if exists
function loadImage(filename) {
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  if (fs.existsSync(filepath)) {
    return fs.readFileSync(filepath);
  }
  return null;
}

// Helper to create image paragraph (desktop)
function createImageParagraph(filename, caption, width = 580, height = 370) {
  const imageData = loadImage(filename);
  if (!imageData) {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `[Imagen: ${filename}]`, italics: true, color: "999999" })]
    });
  }
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [new ImageRun({
        type: "png",
        data: imageData,
        transformation: { width, height },
        altText: { title: caption, description: caption, name: filename }
      })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [new TextRun({ text: caption, italics: true, size: 20, color: "666666" })]
    })
  ];
}

// Helper to create mobile image (smaller)
function createMobileImageParagraph(filename, caption) {
  const imageData = loadImage(filename);
  if (!imageData) {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `[Imagen: ${filename}]`, italics: true, color: "999999" })]
    });
  }
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 50 },
      children: [new ImageRun({
        type: "png",
        data: imageData,
        transformation: { width: 180, height: 390 },
        altText: { title: caption, description: caption, name: filename }
      })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: caption, italics: true, size: 18, color: "666666" })]
    })
  ];
}

// Create document
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 24 }
      }
    },
    paragraphStyles: [
      {
        id: "Title",
        name: "Title",
        basedOn: "Normal",
        run: { size: 72, bold: true, color: DARK_COLOR, font: "Calibri Light" },
        paragraph: { spacing: { before: 0, after: 200 }, alignment: AlignmentType.CENTER }
      },
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 36, bold: true, color: PRIMARY_COLOR, font: "Calibri Light" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, color: DARK_COLOR, font: "Calibri" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 }
      },
      {
        id: "Subtitle",
        name: "Subtitle",
        basedOn: "Normal",
        run: { size: 28, color: "666666", font: "Calibri Light", italics: true },
        paragraph: { spacing: { before: 100, after: 400 }, alignment: AlignmentType.CENTER }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullet-list",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "bullet-list-2",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "numbered-list",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "numbered-list-2",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "Heal Platform", color: PRIMARY_COLOR, size: 20 })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Heal Chile - ", size: 18, color: "999999" }),
            new TextRun({ text: "Confidencial", size: 18, color: "999999", italics: true }),
            new TextRun({ text: "  |  Pag. ", size: 18, color: "999999" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "999999" })
          ]
        })]
      })
    },
    children: [
      // ==================== PORTADA ====================
      new Paragraph({ spacing: { before: 2000 }, children: [] }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "HEAL", size: 120, bold: true, color: PRIMARY_COLOR, font: "Calibri Light" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: "PLATFORM", size: 60, color: DARK_COLOR, font: "Calibri Light" })]
      }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", size: 24, color: PRIMARY_COLOR })]
      }),

      new Paragraph({
        style: "Subtitle",
        children: [new TextRun("Sistema de Gestion para Centros de Kinesiologia")]
      }),

      new Paragraph({ spacing: { before: 1500 }, children: [] }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Propuesta de Valor para Modelo de Franquicias", size: 26, color: "666666" })]
      }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 800 },
        children: [new TextRun({ text: "Enero 2026", size: 22, color: "999999" })]
      }),

      // ==================== PAGE BREAK ====================
      new Paragraph({ children: [new PageBreak()] }),

      // ==================== QUE ES HEAL ====================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("1. Que es Heal Chile")]
      }),

      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({
          text: "Heal Chile es un centro de kinesiologia ubicado en Santiago, con un modelo operativo diferenciado que combina excelencia clinica con eficiencia administrativa.",
          size: 24
        })]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Nuestro Diferenciador")]
      }),

      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: "Modelo operativo estandarizado y replicable", size: 24 })]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: "Gestion de profesionales basada en metas y rendimiento", size: 24 })]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: "Control financiero con conciliacion automatizada", size: 24 })]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun({ text: "Tecnologia propia para gestion del negocio", size: 24 })]
      }),

      // ==================== PAGE BREAK ====================
      new Paragraph({ children: [new PageBreak()] }),

      // ==================== EL PROBLEMA ====================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("2. El Problema")]
      }),

      new Paragraph({
        spacing: { after: 300 },
        children: [new TextRun({
          text: "Los centros de kinesiologia en Chile enfrentan un desafio comun: las herramientas disponibles gestionan lo clinico pero no el negocio.",
          size: 24
        })]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Medilink: Lo que hace bien")]
      }),

      new Paragraph({
        numbering: { reference: "numbered-list", level: 0 },
        children: [new TextRun({ text: "Agenda de pacientes y reservas", size: 24 })]
      }),
      new Paragraph({
        numbering: { reference: "numbered-list", level: 0 },
        children: [new TextRun({ text: "Fichas clinicas y evoluciones", size: 24 })]
      }),
      new Paragraph({
        numbering: { reference: "numbered-list", level: 0 },
        children: [new TextRun({ text: "Facturacion y boletas", size: 24 })]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Lo que falta")]
      }),

      createProblemTable(),

      new Paragraph({
        spacing: { before: 300 },
        children: [new TextRun({
          text: "Resultado: Los administradores pasan horas en Excel reconciliando datos, calculando liquidaciones manualmente y sin visibilidad del rendimiento real del equipo.",
          size: 24,
          italics: true,
          color: "666666"
        })]
      }),

      // ==================== PAGE BREAK ====================
      new Paragraph({ children: [new PageBreak()] }),

      // ==================== LA SOLUCION ====================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("3. La Solucion: Heal Platform")]
      }),

      new Paragraph({
        spacing: { after: 300 },
        children: [new TextRun({
          text: "Una plataforma integral que complementa Medilink, transformando datos clinicos en inteligencia de negocio.",
          size: 24
        })]
      }),

      // Feature 1
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.1 Dashboard Administrativo")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({
          text: "Panel unificado con metricas clave del centro: sesiones del equipo, cumplimiento de metas, ingresos y alertas importantes.",
          size: 24
        })]
      }),

      // Dashboard image
      ...createImageParagraph('01-dashboard-admin.png', 'Dashboard Administrativo - Vista general del centro'),

      // ==================== PAGE BREAK ====================
      new Paragraph({ children: [new PageBreak()] }),

      // Feature 2
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.2 Gestion de Profesionales")]
      }),

      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({
          text: "Sistema completo para administrar el equipo de kinesiologos con toda su informacion centralizada.",
          size: 24
        })]
      }),

      // Profesionales list image
      ...createImageParagraph('02-profesionales-lista.png', 'Lista de profesionales del centro'),

      new Paragraph({
        numbering: { reference: "bullet-list-2", level: 0 },
        children: [new TextRun({ text: "Contratos: Honorarios, Part-time, Full-time, Practicantes", size: 24, bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list-2", level: 0 },
        children: [new TextRun({ text: "Metas mensuales: Objetivos de sesiones con bonos por cumplimiento", size: 24, bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list-2", level: 0 },
        children: [new TextRun({ text: "Liquidaciones automaticas: Calculo de pagos con detalle transparente", size: 24, bold: true })]
      }),

      // ==================== PAGE BREAK ====================
      new Paragraph({ children: [new PageBreak()] }),

      // Detalle del profesional
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Vista Detallada del Profesional")]
      }),

      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({
          text: "Interfaz con pestanas para acceder a toda la informacion de cada profesional:",
          size: 24
        })]
      }),

      // Tab Info
      ...createImageParagraph('03-profesional-detalle-info.png', 'Pestana Info - Datos personales y de contacto', 560, 350),

      // ==================== PAGE BREAK ====================
      new Paragraph({ children: [new PageBreak()] }),

      // Tab Contrato
      ...createImageParagraph('04-profesional-detalle-contrato.png', 'Pestana Contrato - Tipo de contratacion y condiciones', 560, 350),

      // Tab Metas
      ...createImageParagraph('05-profesional-detalle-metas.png', 'Pestana Metas - Objetivos mensuales y progreso', 560, 350),

      // ==================== PAGE BREAK ====================
      new Paragraph({ children: [new PageBreak()] }),

      // Tab Liquidaciones
      ...createImageParagraph('06-profesional-detalle-liquidaciones.png', 'Pestana Liquidaciones - Historial de pagos', 560, 350),

      // ==================== PAGE BREAK ====================
      new Paragraph({ children: [new PageBreak()] }),

      // Feature 3 - Portal del Profesional
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.3 Portal del Profesional (PWA Mobile)")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({
          text: "Aplicacion movil instalable donde cada kinesiologo puede ver su agenda, progreso de metas y liquidaciones desde su celular.",
          size: 24
        })]
      }),

      // Mobile screenshots in a row
      createMobileGallery(),

      // ==================== PAGE BREAK ====================
      new Paragraph({ children: [new PageBreak()] }),

      // Feature 4
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.4 Conciliacion Transbank")]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({
          text: "Importacion de reportes de Transbank para conciliacion automatica con pagos registrados. Identifica discrepancias y facilita la cuadratura financiera mensual.",
          size: 24
        })]
      }),

      // ==================== PAGE BREAK ====================
      new Paragraph({ children: [new PageBreak()] }),

      // ==================== PROPUESTA FRANQUICIAS ====================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("4. Propuesta de Valor para Franquicias")]
      }),

      new Paragraph({
        spacing: { after: 300 },
        children: [new TextRun({
          text: "Heal Platform no es solo software - es el corazon del modelo operativo franquiciable.",
          size: 26,
          bold: true,
          color: PRIMARY_COLOR
        })]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("El Paquete de Franquicia Incluye")]
      }),

      createFranchiseTable(),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Beneficios para el Franquiciado")]
      }),

      new Paragraph({
        numbering: { reference: "numbered-list-2", level: 0 },
        spacing: { after: 100 },
        children: [
          new TextRun({ text: "Operacion desde el dia 1: ", size: 24, bold: true }),
          new TextRun({ text: "Sin curva de aprendizaje en gestion", size: 24 })
        ]
      }),
      new Paragraph({
        numbering: { reference: "numbered-list-2", level: 0 },
        spacing: { after: 100 },
        children: [
          new TextRun({ text: "Control total: ", size: 24, bold: true }),
          new TextRun({ text: "Visibilidad de metricas en tiempo real", size: 24 })
        ]
      }),
      new Paragraph({
        numbering: { reference: "numbered-list-2", level: 0 },
        spacing: { after: 100 },
        children: [
          new TextRun({ text: "Escalabilidad: ", size: 24, bold: true }),
          new TextRun({ text: "El mismo sistema funciona para 3 o 30 profesionales", size: 24 })
        ]
      }),
      new Paragraph({
        numbering: { reference: "numbered-list-2", level: 0 },
        spacing: { after: 100 },
        children: [
          new TextRun({ text: "Soporte centralizado: ", size: 24, bold: true }),
          new TextRun({ text: "Actualizaciones y mejoras continuas", size: 24 })
        ]
      }),

      // ==================== PAGE BREAK ====================
      new Paragraph({ children: [new PageBreak()] }),

      // ==================== STACK TECNOLOGICO ====================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("5. Stack Tecnologico")]
      }),

      new Paragraph({
        spacing: { after: 300 },
        children: [new TextRun({
          text: "Arquitectura moderna, escalable y mantenible.",
          size: 24
        })]
      }),

      createTechStackTable(),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Arquitectura")]
      }),

      new Paragraph({
        spacing: { after: 200 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({
          text: `
┌─────────────────────────────────────────────────────┐
│                   HEAL PLATFORM                      │
├─────────────────────┬───────────────────────────────┤
│   Portal Admin      │   Portal Profesional (PWA)    │
│   (React Web)       │   (React Mobile-First)        │
├─────────────────────┴───────────────────────────────┤
│              API REST (NestJS)                       │
├─────────────────────────────────────────────────────┤
│           PostgreSQL (Supabase)                      │
├─────────────────────┬───────────────────────────────┤
│   Sync Medilink     │   Import Transbank            │
└─────────────────────┴───────────────────────────────┘`,
          size: 18,
          font: "Consolas"
        })]
      }),

      // ==================== PAGE BREAK ====================
      new Paragraph({ children: [new PageBreak()] }),

      // ==================== CONTACTO ====================
      new Paragraph({ spacing: { before: 2000 }, children: [] }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "HEAL", size: 80, bold: true, color: PRIMARY_COLOR, font: "Calibri Light" })]
      }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 400 },
        children: [new TextRun({ text: "━━━━━━━━━━━━━━━━━━━━━━", size: 24, color: PRIMARY_COLOR })]
      }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "Transformando la gestion de centros de kinesiologia", size: 28, color: DARK_COLOR, italics: true })]
      }),

      new Paragraph({ spacing: { before: 800 }, children: [] }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Contacto", size: 24, bold: true, color: DARK_COLOR })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100 },
        children: [new TextRun({ text: "heal-chile.vercel.app", size: 22, color: PRIMARY_COLOR })]
      })
    ]
  }]
});

// Helper function: Mobile Gallery Table
function createMobileGallery() {
  const images = [
    { file: '07-portal-home-mobile.png', caption: 'Home' },
    { file: '08-portal-agenda-mobile.png', caption: 'Agenda' },
    { file: '09-portal-metricas-mobile.png', caption: 'Metricas' },
    { file: '10-portal-liquidaciones-mobile.png', caption: 'Liquidaciones' }
  ];

  const cells = images.map(img => {
    const imageData = loadImage(img.file);
    const children = [];

    if (imageData) {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new ImageRun({
          type: "png",
          data: imageData,
          transformation: { width: 120, height: 260 },
          altText: { title: img.caption, description: img.caption, name: img.file }
        })]
      }));
    }

    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: img.caption, size: 18, color: "666666" })]
    }));

    return new TableCell({
      width: { size: 2340, type: WidthType.DXA },
      verticalAlign: VerticalAlign.TOP,
      children
    });
  });

  return new Table({
    columnWidths: [2340, 2340, 2340, 2340],
    rows: [new TableRow({ children: cells })]
  });
}

// Helper function: Problem Table
function createProblemTable() {
  const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" };
  const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

  return new Table({
    columnWidths: [4680, 4680],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            borders: cellBorders,
            width: { size: 4680, type: WidthType.DXA },
            shading: { fill: PRIMARY_COLOR, type: ShadingType.CLEAR },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Necesidad", bold: true, color: "FFFFFF", size: 22 })]
            })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 4680, type: WidthType.DXA },
            shading: { fill: PRIMARY_COLOR, type: ShadingType.CLEAR },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Estado Actual", bold: true, color: "FFFFFF", size: 22 })]
            })]
          })
        ]
      }),
      createTableRow("Contratos de profesionales", "Manual / Excel", cellBorders),
      createTableRow("Metas de sesiones mensuales", "No existe", cellBorders),
      createTableRow("Liquidaciones con detalle", "Calculo manual", cellBorders),
      createTableRow("Control de productividad", "Reportes basicos", cellBorders),
      createTableRow("Conciliacion Transbank", "Manual / Excel", cellBorders)
    ]
  });
}

// Helper function: Franchise Table
function createFranchiseTable() {
  const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" };
  const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

  return new Table({
    columnWidths: [3120, 6240],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            borders: cellBorders,
            width: { size: 3120, type: WidthType.DXA },
            shading: { fill: PRIMARY_COLOR, type: ShadingType.CLEAR },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Componente", bold: true, color: "FFFFFF", size: 22 })]
            })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 6240, type: WidthType.DXA },
            shading: { fill: PRIMARY_COLOR, type: ShadingType.CLEAR },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Descripcion", bold: true, color: "FFFFFF", size: 22 })]
            })]
          })
        ]
      }),
      createTableRow("Heal Platform", "Acceso completo al sistema de gestion", cellBorders),
      createTableRow("Modelo Operativo", "Procesos estandarizados de gestion de equipo", cellBorders),
      createTableRow("Capacitacion", "Entrenamiento en uso de la plataforma", cellBorders),
      createTableRow("Soporte", "Asistencia tecnica y actualizaciones", cellBorders)
    ]
  });
}

// Helper function: Tech Stack Table
function createTechStackTable() {
  const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" };
  const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

  return new Table({
    columnWidths: [3120, 3120, 3120],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            borders: cellBorders,
            width: { size: 3120, type: WidthType.DXA },
            shading: { fill: PRIMARY_COLOR, type: ShadingType.CLEAR },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Capa", bold: true, color: "FFFFFF", size: 22 })]
            })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 3120, type: WidthType.DXA },
            shading: { fill: PRIMARY_COLOR, type: ShadingType.CLEAR },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Tecnologia", bold: true, color: "FFFFFF", size: 22 })]
            })]
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 3120, type: WidthType.DXA },
            shading: { fill: PRIMARY_COLOR, type: ShadingType.CLEAR },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Beneficio", bold: true, color: "FFFFFF", size: 22 })]
            })]
          })
        ]
      }),
      createTableRow3Col("Frontend", "React + Vite + Tailwind", "UI moderna y rapida", cellBorders),
      createTableRow3Col("Backend", "NestJS + Prisma", "API robusta y tipada", cellBorders),
      createTableRow3Col("Database", "PostgreSQL (Supabase)", "Escalable y confiable", cellBorders),
      createTableRow3Col("Mobile", "PWA", "Instalable sin app store", cellBorders)
    ]
  });
}

// Helper: Create 2-column table row
function createTableRow(col1, col2, cellBorders) {
  return new TableRow({
    children: [
      new TableCell({
        borders: cellBorders,
        width: { size: 4680, type: WidthType.DXA },
        children: [new Paragraph({
          children: [new TextRun({ text: col1, size: 22 })]
        })]
      }),
      new TableCell({
        borders: cellBorders,
        width: { size: 4680, type: WidthType.DXA },
        children: [new Paragraph({
          children: [new TextRun({ text: col2, size: 22, color: "666666" })]
        })]
      })
    ]
  });
}

// Helper: Create 3-column table row
function createTableRow3Col(col1, col2, col3, cellBorders) {
  return new TableRow({
    children: [
      new TableCell({
        borders: cellBorders,
        width: { size: 3120, type: WidthType.DXA },
        children: [new Paragraph({
          children: [new TextRun({ text: col1, size: 22, bold: true })]
        })]
      }),
      new TableCell({
        borders: cellBorders,
        width: { size: 3120, type: WidthType.DXA },
        children: [new Paragraph({
          children: [new TextRun({ text: col2, size: 22 })]
        })]
      }),
      new TableCell({
        borders: cellBorders,
        width: { size: 3120, type: WidthType.DXA },
        children: [new Paragraph({
          children: [new TextRun({ text: col3, size: 22, color: "666666" })]
        })]
      })
    ]
  });
}

// Generate the document
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(path.join(__dirname, "Heal-Platform-Completo.docx"), buffer);
  console.log("✅ Documento creado: Heal-Platform-Presentacion.docx");
  console.log("   Con imagenes de la plataforma incluidas!");
}).catch(err => {
  console.error("Error:", err);
});
