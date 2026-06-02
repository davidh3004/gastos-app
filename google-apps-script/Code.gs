// ============================================================
// CONFIGURACIÓN
// ============================================================
const CONFIG = {
  TOKEN: "david2026finanzas",
  COLUMNA_PATRON: 2,
  COLUMNA_CATEGORIA: 3
};

const NOMBRES_MESES = {
  "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril",
  "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto",
  "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre"
};

// Mapeo inverso: "Febrero" -> "02", etc.
const MESES_A_CODIGO = {};
for (const [k, v] of Object.entries(NOMBRES_MESES)) MESES_A_CODIGO[v] = k;

function encontrarHoja(palabraClave) {
  const hojas = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  for (let h of hojas) {
    if (h.getName().includes(palabraClave)) return h;
  }
  return null;
}

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return respuesta({ ok: false, error: "No se recibió body" });
    }
    const datos = JSON.parse(e.postData.contents);
    if (datos.token !== CONFIG.TOKEN) {
      return respuesta({ ok: false, error: "Token incorrecto" });
    }
    if (datos.accion === "categorizar") return categorizar(datos.descripcion);
    if (datos.accion === "guardar") return guardarTransaccion(datos);
    if (datos.accion === "actualizar_meta") return actualizarMeta(datos);
    return respuesta({ ok: false, error: "Acción no reconocida" });
  } catch (err) {
    return respuesta({ ok: false, error: "Error: " + err.message });
  }
}

// ============================================================
// CATEGORIZACIÓN
// ============================================================
function categorizar(descripcion) {
  if (!descripcion) return respuesta({ ok: true, categoria: "Sin categorizar" });
  const sheet = encontrarHoja("Reglas");
  if (!sheet) return respuesta({ ok: false, error: "No encontré la hoja Reglas" });
  const datos = sheet.getDataRange().getValues();
  const descUpper = descripcion.toUpperCase();
  for (let i = 3; i < datos.length; i++) {
    const patron = String(datos[i][CONFIG.COLUMNA_PATRON - 1]).toUpperCase().trim();
    if (patron && descUpper.includes(patron)) {
      return respuesta({ ok: true, categoria: datos[i][CONFIG.COLUMNA_CATEGORIA - 1] });
    }
  }
  return respuesta({ ok: true, categoria: "Sin categorizar" });
}

// ============================================================
// GUARDAR TRANSACCIÓN
// ============================================================
function guardarTransaccion(datos) {
  const sheet = encontrarHoja("Transacciones");
  if (!sheet) return respuesta({ ok: false, error: "No encontré la hoja Transacciones" });

  const valores = sheet.getRange("B2:B1000").getValues();
  let ultimaFila = 2;
  for (let i = 0; i < valores.length; i++) {
    if (valores[i][0] !== "" && valores[i][0] !== null) {
      ultimaFila = i + 3;
    }
  }

  const monto = datos.tipo === "Gasto"
    ? -Math.abs(parseFloat(datos.monto))
    :  Math.abs(parseFloat(datos.monto));

  const partes = datos.fecha.split("-");
  const fecha = new Date(
    parseInt(partes[0]),
    parseInt(partes[1]) - 1,
    parseInt(partes[2]),
    12, 0, 0
  );

  sheet.getRange(ultimaFila, 1).setValue(ultimaFila - 1).setFontColor('#000000');
  sheet.getRange(ultimaFila, 2).setValue(fecha);
  sheet.getRange(ultimaFila, 2).setNumberFormat("DD-MMM-YYYY");
  sheet.getRange(ultimaFila, 3).setValue(datos.descripcion.toUpperCase()).setFontFamily("Arial").setFontSize(10);
  sheet.getRange(ultimaFila, 4).setValue(datos.tipo);
  if (datos.tipo != "Gasto"){
    sheet.getRange(ultimaFila, 5).setValue(monto).setFontColor('green').setFontFamily("Arial").setFontSize(10);
  } else {
    sheet.getRange(ultimaFila, 5).setValue(monto).setFontFamily("Arial").setFontSize(10);
  }
  sheet.getRange(ultimaFila, 6).setValue(datos.categoria);

  // Responder INMEDIATAMENTE al Shortcut
  // La actualización de Mes a Mes corre por separado
  programarActualizacion();

  return respuesta({ ok: true, mensaje: "✅ Guardado: " + datos.descripcion });
}

function programarActualizacion() {
  // Crea un trigger que corre actualizarMesAMes 1 minuto después
  // Primero borra triggers anteriores pendientes para no acumular
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === "actualizarMesAMes") {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger("actualizarMesAMes")
    .timeBased()
    .after(60000) // 60 segundos después
    .create();
}

function verificarJunio() {
  const sheet = encontrarHoja("Transacciones");
  
  // Ver G133 y G134
  const g133 = sheet.getRange("G133").getValue();
  const g134 = sheet.getRange("G134").getValue();
  Logger.log("G133: '" + g133 + "' | tipo: " + typeof g133 + " | match: " + (g133.toString().trim().match(/^\d{4}-\d{2}$/) ? "SÍ" : "NO"));
  Logger.log("G134: '" + g134 + "' | tipo: " + typeof g134 + " | match: " + (g134.toString().trim().match(/^\d{4}-\d{2}$/) ? "SÍ" : "NO"));

  // Ver las primeras 5 filas con fórmula para comparar
  for (let i = 2; i <= 6; i++) {
    const v = sheet.getRange("G" + i).getValue();
    Logger.log("G" + i + ": '" + v + "' | tipo: " + typeof v);
  }
}

// ============================================================
// ACTUALIZAR MES A MES
// ============================================================
function actualizarMesAMes() {
  const sheetTrans = encontrarHoja("Transacciones");
  const sheetMes   = encontrarHoja("Mes a Mes");
  if (!sheetTrans || !sheetMes) return;

  const FILA_HEADERS = 4;

  // === 1. Meses únicos en Transacciones ===
  const colMes = sheetTrans.getRange("G2:G1000").getValues();
  const mesesUnicos = new Set();
  colMes.forEach(r => {
  let v = r[0];
  if (!v) return;
  // Si es un objeto Date, convertirlo a yyyy-MM
  if (v instanceof Date) {
    const año = v.getFullYear();
    const mes = String(v.getMonth() + 1).padStart(2, "0");
    v = `${año}-${mes}`;
  }
  v = v.toString().trim();
  if (v.match(/^\d{4}-\d{2}$/)) mesesUnicos.add(v);
});
  const mesesOrdenados = Array.from(mesesUnicos).sort();

  // === 2. Headers actuales en Mes a Mes ===
  const totalCols = sheetMes.getLastColumn();
  const headers = sheetMes.getRange(FILA_HEADERS, 1, 1, totalCols).getValues()[0];

  // Encontrar columna de Promedio
  let colPromedio = -1;
  for (let i = 0; i < headers.length; i++) {
    if (headers[i].toString().includes("Promedio")) { colPromedio = i + 1; break; }
  }
  if (colPromedio === -1) return;

  // Construir mapa de qué códigos yyyy-MM ya están en la tabla
  // Detecta tanto "Mayo" (sin año) como "Mayo 2026" (con año)
  const codigosEnTabla = new Set();
  for (let i = 1; i < headers.length; i++) {
    const h = headers[i].toString().trim();
    if (!h || h.includes("Promedio")) continue;

    // Buscar si tiene año explícito: "Junio 2026"
    const matchConAño = h.match(/^(\w+)\s+(\d{4})$/);
    if (matchConAño) {
      const nombreMes = matchConAño[1];
      const año = matchConAño[2];
      const codigo = MESES_A_CODIGO[nombreMes];
      if (codigo) codigosEnTabla.add(`${año}-${codigo}`);
      continue;
    }

    // Sin año: "Mayo" → asumir que cubre cualquier año que esté en las transacciones
    const codigo = MESES_A_CODIGO[h];
    if (codigo) {
      mesesOrdenados.forEach(m => {
        if (m.endsWith("-" + codigo)) codigosEnTabla.add(m);
      });
    }
  }

  // === 3. Insertar columnas para meses nuevos ===
  // Recargar colPromedio porque puede cambiar con inserciones
  let insertados = 0;
  for (const mes of mesesOrdenados) {
    if (codigosEnTabla.has(mes)) continue;

    const partes = mes.split("-");
    const nombreMes = NOMBRES_MESES[partes[1]]; // "Junio"

    // Insertar antes de Promedio (ajustando por columnas ya insertadas)
    const colInsertar = colPromedio + insertados;
    sheetMes.insertColumnBefore(colInsertar);

    const hCell = sheetMes.getRange(FILA_HEADERS, colInsertar);
    hCell.setValue(nombreMes);
    hCell.setBackground("#1F4E78");
    hCell.setFontColor("#FFFFFF");
    hCell.setFontWeight("bold");
    hCell.setHorizontalAlignment("center");

    // Llenar fórmulas en esa columna
    _llenarColumna(sheetMes, colInsertar, mes, FILA_HEADERS);

    insertados++;
    codigosEnTabla.add(mes); // evitar duplicados si hay otro mes igual
  }

  // === 4. Reparar columna Promedio ===
  _repararPromedio(sheetMes, FILA_HEADERS);

  // === 5. Sincronizar categorías nuevas ===
  actualizarCategorias();
}

// ============================================================
// LLENAR FÓRMULAS EN COLUMNA NUEVA
// ============================================================
function _llenarColumna(sheetMes, col, codigoMes, filaHeaders) {
  const totalFilas = sheetMes.getLastRow();
  const T = "'💳 Transacciones'";
  const montos = `${T}!$E$2:$E$1000`;
  const cats   = `${T}!$F$2:$F$1000`;
  const meses  = `${T}!$G$2:$G$1000`;
  const cL     = _col(col);

  const filaI = _buscarFila(sheetMes, filaHeaders, "TOTAL INGRESOS");
  const filaG = _buscarFila(sheetMes, filaHeaders, "TOTAL GASTOS");
  const filaGastosTitulo = _buscarFila(sheetMes, filaHeaders, "GASTOS");

  for (let fila = filaHeaders + 1; fila <= totalFilas; fila++) {
    const etiqueta = sheetMes.getRange(fila, 1).getValue().toString().trim();
    if (!etiqueta) continue;

    const celda = sheetMes.getRange(fila, col);

    if (etiqueta === "INGRESOS" || etiqueta === "GASTOS") {
      continue;

    } else if (etiqueta === "Nómina") {
      celda.setFormula(`=SUMIFS(${montos};${meses};"${codigoMes}";${cats};"Nómina")`);
      celda.setNumberFormat('"RD$ "#,##0');

    } else if (etiqueta.includes("Ingreso Extra")) {
      celda.setFormula(`=SUMIFS(${montos};${meses};"${codigoMes}";${cats};"Ingreso Extra/Transferencias Recibidas")`);
      celda.setNumberFormat('"RD$ "#,##0');

    } else if (etiqueta === "TOTAL INGRESOS") {
      celda.setFormula(`=${cL}${fila-2}+${cL}${fila-1}`);
      celda.setNumberFormat('"RD$ "#,##0');
      celda.setFontWeight("bold");
      celda.setBackground("#C6EFCE");

    } else if (etiqueta === "TOTAL GASTOS") {
      if (filaGastosTitulo > 0) {
        celda.setFormula(`=SUM(${cL}${filaGastosTitulo+1}:${cL}${fila-1})`);
        celda.setNumberFormat('"RD$ "#,##0');
        celda.setFontWeight("bold");
        celda.setBackground("#FFC7CE");
      }

    } else if (etiqueta.includes("FLUJO NETO")) {
      if (filaI > 0 && filaG > 0) {
        celda.setFormula(`=${cL}${filaI}-${cL}${filaG}`);
        celda.setNumberFormat('"RD$ "#,##0;[Red]"RD$ -"#,##0');
        celda.setFontWeight("bold");
        celda.setBackground("#D9E1F2");
      }

    } else if (etiqueta.includes("Tasa de Ahorro")) {
      if (filaI > 0) {
        celda.setFormula(`=IFERROR(${cL}${fila-1}/${cL}${filaI};0)`);
        celda.setNumberFormat('0.0%');
        celda.setFontWeight("bold");
      }

    } else {
      celda.setFormula(`=ABS(SUMIFS(${montos};${meses};"${codigoMes}";${cats};"${etiqueta}";${montos};"<0"))`);
      celda.setNumberFormat('"RD$ "#,##0');
    }
  }
}

function _repararPromedio(sheetMes, filaHeaders) {
  const totalCols = sheetMes.getLastColumn();
  const totalFilas = sheetMes.getLastRow();
  const headers = sheetMes.getRange(filaHeaders, 1, 1, totalCols).getValues()[0];

  let colPromedio = -1;
  for (let i = 0; i < headers.length; i++) {
    if (headers[i].toString().includes("Promedio")) { colPromedio = i + 1; break; }
  }
  if (colPromedio === -1) return;

  const inicioLetra = "B";
  const finLetra = _col(colPromedio - 1);

  for (let fila = filaHeaders + 1; fila <= totalFilas; fila++) {
    const etiqueta = sheetMes.getRange(fila, 1).getValue().toString().trim();
    if (!etiqueta) continue;
    if (etiqueta === "INGRESOS" || etiqueta === "GASTOS") continue;
    if (etiqueta.includes("Tasa de Ahorro")) continue;

    const celda = sheetMes.getRange(fila, colPromedio);

    if (etiqueta.includes("FLUJO NETO")) {
      celda.setFormula(`=AVERAGE(${inicioLetra}${fila}:${finLetra}${fila})`);
      celda.setNumberFormat('"RD$ "#,##0;[Red]"RD$ -"#,##0');
      celda.setFontWeight("bold");
    } else {
      celda.setFormula(`=IFERROR(AVERAGE(${inicioLetra}${fila}:${finLetra}${fila});0)`);
      celda.setNumberFormat('"RD$ "#,##0');
      if (etiqueta.includes("TOTAL")) celda.setFontWeight("bold");
    }
  }
}

// ============================================================
// UTILIDADES
// ============================================================
function _col(n) {
  let s = '';
  while (n > 0) { s = String.fromCharCode(64 + (n % 26 || 26)) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

function _buscarFila(sheet, desde, texto) {
  const total = sheet.getLastRow();
  const vals = sheet.getRange("A" + desde + ":A" + total).getValues();
  for (let i = 0; i < vals.length; i++) {
    if (vals[i][0].toString().includes(texto)) return desde + i;
  }
  return -1;
}

function respuesta(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// PRUEBA MANUAL
// ============================================================
function probarActualizacion() {
  actualizarMesAMes();
  Logger.log("Completado");
}

function diagnosticar() {
  const sheetTrans = encontrarHoja("Transacciones");
  const sheetMes = encontrarHoja("Mes a Mes");
  
  // Ver qué meses hay en Transacciones
  const colMes = sheetTrans.getRange("G2:G200").getValues();
  const meses = new Set();
  colMes.forEach(r => {
    const v = r[0] ? r[0].toString().trim() : "";
    if (v.match(/^\d{4}-\d{2}$/)) meses.add(v);
  });
  Logger.log("Meses en Transacciones: " + JSON.stringify(Array.from(meses).sort()));

  // Ver headers actuales en Mes a Mes fila 4
  const totalCols = sheetMes.getLastColumn();
  const headers = sheetMes.getRange(4, 1, 1, totalCols).getValues()[0];
  Logger.log("Headers en Mes a Mes fila 4: " + JSON.stringify(headers));

  // Ver qué columna es Promedio
  for (let i = 0; i < headers.length; i++) {
    if (headers[i].toString().includes("Promedio")) {
      Logger.log("Promedio está en columna: " + (i+1) + " (letra: " + _col(i+1) + ")");
    }
  }
}

function verificarCeldaJunio() {
  const sheet = encontrarHoja("Transacciones");
  const val = sheet.getRange("G132").getValue();
  Logger.log("Valor: '" + val + "'");
  Logger.log("Tipo: " + typeof val);
  Logger.log("toString: '" + val.toString() + "'");
  Logger.log("Match: " + (val.toString().trim().match(/^\d{4}-\d{2}$/) ? "SÍ" : "NO"));
}

function actualizarCategorias() {
  const sheetMes    = encontrarHoja("Mes a Mes");
  const sheetReglas = encontrarHoja("Reglas");
  if (!sheetMes || !sheetReglas) return;

  const FILA_HEADERS = 4;

  // === 1. Categorías de Reglas (solo gastos) ===
  const categoriasIngreso = new Set(["Nómina", "Ingreso Extra/Transferencias Recibidas"]);
  const reglas = sheetReglas.getRange("C4:C200").getValues();
  const categoriasGasto = new Set();
  reglas.forEach(r => {
    const v = r[0] ? r[0].toString().trim() : "";
    if (v && !categoriasIngreso.has(v)) categoriasGasto.add(v);
  });

  // === 2. Etiquetas ya existentes en Mes a Mes ===
  const totalFilas = sheetMes.getLastRow();
  const colA = sheetMes.getRange("A1:A" + totalFilas).getValues();
  const etiquetasExistentes = new Set();
  colA.forEach(r => etiquetasExistentes.add(r[0].toString().trim()));

  // === 3. Encontrar fila TOTAL GASTOS ===
  const filaTotalGastos = _buscarFila(sheetMes, FILA_HEADERS, "TOTAL GASTOS");
  if (filaTotalGastos === -1) return;

  // === 4. Insertar solo categorías de gasto nuevas ===
  let offset = 0;
  for (const cat of categoriasGasto) {
    // Revisar con y sin espacios
    if (etiquetasExistentes.has(cat) || etiquetasExistentes.has("" + cat)) continue;

    const filaInsertar = filaTotalGastos + offset;
    sheetMes.insertRowBefore(filaInsertar);
    sheetMes.getRange(filaInsertar, 1).setValue("" + cat);
    sheetMes.getRange(filaInsertar, 1).setFontSize(10);
    offset++;
    etiquetasExistentes.add("" + cat);
  }

  // === 5. Si se insertó algo, rellenar fórmulas ===
  if (offset > 0) {
    _rellenarTodasLasColumnas(sheetMes, FILA_HEADERS);
  }
}

function _rellenarTodasLasColumnas(sheetMes, filaHeaders) {
  const totalCols = sheetMes.getLastColumn();
  const headers   = sheetMes.getRange(filaHeaders, 1, 1, totalCols).getValues()[0];

  // Encontrar columna Promedio
  let colPromedio = -1;
  for (let i = 0; i < headers.length; i++) {
    if (headers[i].toString().includes("Promedio")) { colPromedio = i + 1; break; }
  }
  if (colPromedio === -1) return;

  // Mapear cada columna de mes a su código yyyy-MM
  for (let col = 2; col < colPromedio; col++) {
    const header = headers[col - 1].toString().trim();
    if (!header) continue;

    // Detectar código de mes desde el header
    let codigoMes = null;

    // Formato "Junio 2026"
    const matchConAño = header.match(/^(\w+)\s+(\d{4})$/);
    if (matchConAño && MESES_A_CODIGO[matchConAño[1]]) {
      codigoMes = `${matchConAño[2]}-${MESES_A_CODIGO[matchConAño[1]]}`;
    }

    // Formato "Junio" sin año — buscar el año en las transacciones
    if (!codigoMes && MESES_A_CODIGO[header]) {
      const codigo = MESES_A_CODIGO[header];
      const sheetTrans = encontrarHoja("Transacciones");
      const colMes = sheetTrans.getRange("G2:G1000").getValues();
      for (const r of colMes) {
        const v = r[0] ? r[0].toString().trim() : "";
        if (v.endsWith("-" + codigo)) { codigoMes = v; break; }
      }
    }

    if (codigoMes) {
      _llenarColumna(sheetMes, col, codigoMes, filaHeaders);
    }
  }

  _repararPromedio(sheetMes, filaHeaders);
}

const DEFAULT_TOKEN = "david2026finanzas";

const SHEETS = {
  TRANSACCIONES: "💳 Transacciones",
  METAS: "🎯 Metas",
  CUENTAS: "💼 Cuentas",
  HISTORIAL: "Historial Patrimonio",
  LIMITES: "⚙️ Configuración",
};

// ============================================================
// ENDPOINTS DE LECTURA PARA LA WEB APP
// ============================================================

function doGet(e) {
  try {
    const params = e.parameter;
    if (params.token !== CONFIG.TOKEN) {
      return respuesta({ ok: false, error: "Token incorrecto" });
    }

    if (params.accion === "resumen_mes") return getResumenMes(params.mes);
    if (params.accion === "transacciones") return getTransacciones(params.mes);
    if (params.accion === "categorias_mes") return getCategoriasMes(params.mes);
    if (params.accion === "metas") return getMetas();
    if (params.accion === "patrimonio") return getPatrimonio();
    if (params.accion === "alertas") return getAlertas();
    if (params.accion === "mes_a_mes") return getMesAMes();

    return respuesta({ ok: false, error: "Acción no reconocida" });
  } catch (err) {
    return respuesta({ ok: false, error: err.message });
  }
}

function getResumenMes(mes) {
  const sheet = encontrarHoja("Transacciones");
  const datos = sheet.getRange("A2:G1000").getValues();
  const mesActual = mes || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM");

  let ingresos = 0, gastos = 0;
  datos.forEach(r => {
    if (!r[1] || r[6].toString() !== mesActual) return;
    const monto = parseFloat(r[4]) || 0;
    if (monto > 0) ingresos += monto;
    else gastos += Math.abs(monto);
  });

  return respuesta({
    ok: true,
    mes: mesActual,
    ingresos: Math.round(ingresos),
    gastos: Math.round(gastos),
    flujo_neto: Math.round(ingresos - gastos),
    tasa_ahorro: ingresos > 0 ? Math.round((ingresos - gastos) / ingresos * 100) : 0
  });
}

function getCategoriasMes(mes) {
  const sheet = encontrarHoja("Transacciones");
  const datos = sheet.getRange("A2:G1000").getValues();
  const mesActual = mes || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM");

  const categorias = {};
  datos.forEach(r => {
    if (!r[1] || r[6].toString() !== mesActual) return;
    const monto = parseFloat(r[4]) || 0;
    if (monto >= 0) return; // solo gastos
    const cat = r[5].toString() || "Sin categorizar";
    categorias[cat] = (categorias[cat] || 0) + Math.abs(monto);
  });

  const resultado = Object.entries(categorias)
    .map(([nombre, total]) => ({ nombre, total: Math.round(total) }))
    .sort((a, b) => b.total - a.total);

  return respuesta({ ok: true, mes: mesActual, categorias: resultado });
}

function getTransacciones(mes) {
  const sheet = encontrarHoja("Transacciones");
  const datos = sheet.getRange("A2:G1000").getValues();
  const mesActual = mes || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM");

  const txs = [];
  datos.forEach(r => {
    if (!r[1] || (mes && r[6].toString() !== mesActual)) return;
    const fecha = r[1] instanceof Date
      ? Utilities.formatDate(r[1], Session.getScriptTimeZone(), "yyyy-MM-dd")
      : r[1].toString();
    txs.push({
      id: r[0],
      fecha,
      descripcion: r[2].toString(),
      tipo: r[3].toString(),
      monto: Math.round(parseFloat(r[4]) || 0),
      categoria: r[5].toString(),
      mes: r[6].toString()
    });
  });

  return respuesta({ ok: true, transacciones: txs });
}

function getMetas() {
  const sheet = encontrarHoja("Metas");
  if (!sheet) return respuesta({ ok: false, error: "No encontré hoja Metas" });
  const datos = sheet.getRange("A2:G100").getValues();

  const metas = datos
    .filter(r => r[1])
    .map(r => ({
      id: r[0],
      nombre: r[1].toString(),
      tipo: r[2].toString(),
      objetivo: parseFloat(r[3]) || 0,
      fecha_limite: r[4].toString(),
      actual: parseFloat(r[5]) || 0,
      notas: r[6].toString()
    }));

  return respuesta({ ok: true, metas });
}

// ============================================================
// ACTUALIZAR META (POST)
// ============================================================
function actualizarMeta(datos) {
  const sheet = encontrarHoja("Metas");
  if (!sheet) return respuesta({ ok: false, error: "No encontré hoja Metas" });

  const valores = sheet.getRange("A2:G100").getValues();
  for (let i = 0; i < valores.length; i++) {
    if (valores[i][0].toString() === datos.id.toString()) {
      const fila = i + 2;
      const tipo =
        datos.tipo != null && datos.tipo !== ""
          ? datos.tipo
          : valores[i][2];

      sheet.getRange(fila, 2).setValue(datos.nombre);
      sheet.getRange(fila, 3).setValue(tipo);
      sheet.getRange(fila, 4).setValue(parseFloat(datos.objetivo));
      sheet.getRange(fila, 5).setValue(_parsearFechaMeta(datos.fecha_limite));
      sheet.getRange(fila, 6).setValue(parseFloat(datos.actual));
      sheet.getRange(fila, 7).setValue(datos.notas || "");
      return respuesta({ ok: true, mensaje: "Meta actualizada correctamente" });
    }
  }
  return respuesta({ ok: false, error: "Meta no encontrada" });
}

/** Acepta yyyy-MM-dd o valor ya guardado en la hoja. */
function _parsearFechaMeta(fecha) {
  if (!fecha) return "";
  if (fecha instanceof Date) return fecha;
  const str = fecha.toString().trim();
  const partes = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (partes) {
    return new Date(
      parseInt(partes[1], 10),
      parseInt(partes[2], 10) - 1,
      parseInt(partes[3], 10),
      12, 0, 0
    );
  }
  return str;
}

function getPatrimonio() {
  const sheet = encontrarHoja("Cuentas");
  if (!sheet) return respuesta({ ok: false, error: "No encontré hoja Cuentas" });
  const datos = sheet.getRange("A2:E500").getValues();

  // Agrupar por fecha snapshot
  const snapshots = {};
  datos.forEach(r => {
    if (!r[0] || !r[1]) return;
    const fecha = r[0] instanceof Date
      ? Utilities.formatDate(r[0], Session.getScriptTimeZone(), "yyyy-MM-dd")
      : r[0].toString();
    if (!snapshots[fecha]) snapshots[fecha] = [];
    snapshots[fecha].push({
      cuenta: r[1].toString(),
      tipo: r[2].toString(),
      saldo: Math.round(parseFloat(r[3]) || 0),
      notas: r[4].toString()
    });
  });

  // Último snapshot
  const fechas = Object.keys(snapshots).sort();
  const ultimaFecha = fechas[fechas.length - 1];
  const cuentas = snapshots[ultimaFecha] || [];
  const total = cuentas.reduce((sum, c) => sum + c.saldo, 0);

  // Historial de totales por snapshot
  const historial = fechas.map(f => ({
    fecha: f,
    total: snapshots[f].reduce((sum, c) => sum + c.saldo, 0)
  }));

  return respuesta({ ok: true, total, cuentas, historial, ultima_actualizacion: ultimaFecha });
}

function getAlertas() {
  const sheetConfig = encontrarHoja("Configuración");
  const mesActual = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM");
  const categorias = JSON.parse(getCategoriasMes(mesActual).getContent()).categorias;

  // Límites por defecto si no hay hoja de configuración
  const limites = {
    "Restaurantes": 10000,
    "Cafés": 5000,
    "Suscripciones Tech": 3000,
    "Gasolina": 5000,
    "Ropa/Compras": 3000
  };

  // Si existe hoja Configuración, leer límites desde ahí
  if (sheetConfig) {
    const datos = sheetConfig.getRange("A2:B100").getValues();
    datos.forEach(r => {
      if (r[0] && r[1]) limites[r[0].toString()] = parseFloat(r[1]) || 0;
    });
  }

  const alertas = categorias
    .filter(c => limites[c.nombre])
    .map(c => {
      const limite = limites[c.nombre];
      const pct = Math.round((c.total / limite) * 100);
      let nivel = "ok";
      if (pct >= 90) nivel = "critico";
      else if (pct >= 70) nivel = "atencion";
      return { categoria: c.nombre, gastado: c.total, limite, porcentaje: pct, nivel };
    })
    .sort((a, b) => b.porcentaje - a.porcentaje);

  return respuesta({ ok: true, alertas });
}

function getMesAMes() {
  const sheet = encontrarHoja("Transacciones");
  const datos = sheet.getRange("A2:G1000").getValues();

  const meses = {};
  datos.forEach(r => {
    if (!r[1]) return;
    const mes = r[6].toString();
    if (!mes.match(/^\d{4}-\d{2}$/)) return;
    if (!meses[mes]) meses[mes] = { ingresos: 0, gastos: 0 };
    const monto = parseFloat(r[4]) || 0;
    if (monto > 0) meses[mes].ingresos += monto;
    else meses[mes].gastos += Math.abs(monto);
  });

  const resultado = Object.entries(meses)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, vals]) => ({
      mes,
      ingresos: Math.round(vals.ingresos),
      gastos: Math.round(vals.gastos),
      flujo: Math.round(vals.ingresos - vals.gastos)
    }));

  return respuesta({ ok: true, meses: resultado });
}