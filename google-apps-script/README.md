# API Google Sheets — Finanzas David

La app Next.js usa **tu Apps Script** (lectura con `doGet` y acciones en `snake_case`). El archivo `Code.gs` de esta carpeta es solo referencia alternativa; si ya tienes el script de lectura en el Sheet, no hace falta reemplazarlo.

## Acciones que espera `src/lib/api.ts`

| Función Next.js | Parámetro `accion` |
|-----------------|-------------------|
| `getResumenMes` | `resumen_mes` |
| `getCategoriasMes` | `categorias_mes` |
| `getTransacciones` | `transacciones` |
| `getMetas` | `metas` |
| `getPatrimonio` | `patrimonio` |
| `getAlertas` | `alertas` |
| `getMesAMes` | `mes_a_mes` |

Errores del script: campo `error` (o `mensaje`). Éxito: `{ ok: true, ... }` con los datos en la raíz del JSON.

---

## Si aún no tienes script desplegado

El error típico *"No se encontró la función doGet"* significa que el script aún no tiene código o no se volvió a desplegar.

## Pasos para arreglarlo

### 1. Abrir el Google Sheet

Abre el libro de finanzas donde están tus datos.

### 2. Crear / pegar el script

1. **Extensiones → Apps Script**
2. Borra el contenido por defecto de `Code.gs`
3. Copia todo el archivo `google-apps-script/Code.gs` de este repo y pégalo
4. Guarda (Ctrl+S)

### 3. Nombres de hojas requeridos

El script espera estas pestañas (puedes renombrar en `SHEETS` dentro de `Code.gs` si usas otros nombres):

| Hoja | Columnas (fila 1 = encabezados) |
|------|----------------------------------|
| **Transacciones** | id, fecha, descripcion, tipo, monto, categoria, mes |
| **Metas** | id, nombre, tipo, objetivo, fecha_limite, actual, notas |
| **Cuentas** | cuenta, tipo, saldo, notas |
| **Historial Patrimonio** | fecha, total *(opcional)* |
| **Limites Alertas** | categoria, limite *(opcional, para alertas)* |

- `tipo` en transacciones: `Ingreso` o `Gasto`
- `mes`: formato `yyyy-MM` (si está vacío, se deduce de `fecha`)
- `tipo` en metas: `Acumulada` o `Recurrente`

### 4. Desplegar como Web App

1. **Implementar → Nueva implementación**
2. Tipo: **Aplicación web**
3. **Ejecutar como:** Yo (tu cuenta)
4. **Quién tiene acceso:** Cualquier persona
5. **Implementar** y copiar la URL que termina en `/exec`

### 5. Actualizar `.env.local`

```env
NEXT_PUBLIC_SCRIPT_URL=https://script.google.com/macros/s/TU_ID/exec
NEXT_PUBLIC_TOKEN=david2026finanzas
```

El token debe coincidir con `DEFAULT_TOKEN` en `Code.gs`, o con la propiedad `API_TOKEN` del script.

### 6. Probar en el navegador

Abre (reemplaza la URL y mes si quieres):

```
https://script.google.com/macros/s/TU_ID/exec?token=david2026finanzas&accion=resumenMes&mes=2026-05
```

Debes ver JSON como:

```json
{"ok":true,"data":{"mes":"2026-05","ingresos":0,"gastos":0,"flujo_neto":0,"tasa_ahorro":0}}
```

Si ves HTML con error, vuelve al paso 4 (nueva implementación tras cambiar código).

### 7. Reiniciar Next.js

```bash
npm run dev
```

## Acciones soportadas (`accion`)

| accion | Parámetros | Descripción |
|--------|------------|-------------|
| `resumenMes` | `mes` opcional | Resumen del mes |
| `categoriasMes` | `mes` opcional | Gastos por categoría |
| `transacciones` | `mes` opcional | Lista de transacciones |
| `metas` | — | Metas |
| `patrimonio` | — | Cuentas y total |
| `alertas` | `mes` opcional | Alertas vs límites |
| `mesAMes` | — | Histórico mensual |

## Script standalone (sin Sheet ligado)

En **Apps Script → Configuración del proyecto → Propiedades del script**:

| Propiedad | Valor |
|-----------|--------|
| `SPREADSHEET_ID` | ID del Sheet (de la URL del documento) |
| `API_TOKEN` | Token secreto (opcional) |

## Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| `doGet` no encontrado | Pegar `Code.gs` y **nueva implementación** web |
| `Token inválido` | Igualar `NEXT_PUBLIC_TOKEN` y `API_TOKEN` / `DEFAULT_TOKEN` |
| `Hoja no encontrada` | Crear la pestaña o ajustar `SHEETS` en el script |
| JSON vacío / ceros | Revisar encabezados y filas en **Transacciones** |
| Cambios no se ven | Siempre **Nueva implementación** después de editar el script |
