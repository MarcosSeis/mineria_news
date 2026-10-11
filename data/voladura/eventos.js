// Catálogo de eventos operativos. SOLO fallas de equipo, suministro, ambiente o resultado:
// nunca personas lesionadas ni accidentes personales.
//
// prob: probabilidad base por voladura. Bandas de rareza (ver eventEngine):
//   comun 10–20 % · poco_comun 3–8 % · raro 1–2 % · extremo < 1 %
// modulo(ctx): multiplica la probabilidad según la configuración del jugador y el reto.
// efecto(ctx): { delta, anular, energia, optimo } (todo opcional).
//   delta: puntos sumados a avance/fragmentacion/control/eficiencia
//   anular: fracción de barrenos útiles que se pierden
//   energia: factor sobre la energía entregada
//   optimo: factores sobre el punto dulce del reto (la roca cambió)

const cargaRelativa = ({ metricas, optimo }) => metricas.q / optimo.q

export const eventos = [
  // --- Perforación ---
  {
    id: 'barrenadora_falla', categoria: 'perforacion', rareza: 'comun', prob: 0.12, icono: 'taladro',
    nombre: 'Falló la barrenadora',
    detalle: 'La barrenadora se detuvo y algunos barrenos quedaron sin perforar.',
    humor: ['La barrenadora pidió un descanso.', 'La barrenadora dijo que su turno ya había terminado.'],
    modulo: ({ valores, optimo }) => Math.min(1.6, Math.max(0.6, valores.barrenos / optimo.barrenos)),
    efecto: () => ({ anular: 0.12, delta: { avance: -3, eficiencia: -6 } })
  },
  {
    id: 'barreno_inutilizable', categoria: 'perforacion', rareza: 'comun', prob: 0.1, icono: 'barreno',
    nombre: 'Barrenos inutilizables',
    detalle: 'Un par de barrenos se obstruyeron y no se pudieron cargar.',
    humor: ['Un barreno decidió no participar.', 'Hubo barrenos que prefirieron quedar en el plano.'],
    efecto: () => ({ anular: 0.06, delta: { fragmentacion: -3 } })
  },
  {
    id: 'mantenimiento', categoria: 'perforacion', rareza: 'poco_comun', prob: 0.05, icono: 'taladro',
    nombre: 'Mantenimiento no programado',
    detalle: 'El equipo entró a mantención fuera de programa y se perdió tiempo.',
    humor: ['El mantenimiento preventivo se volvió correctivo.', 'El equipo tenía una cita con el taller.'],
    efecto: () => ({ delta: { eficiencia: -12, avance: -3 } })
  },
  {
    id: 'equipo_incompleto', categoria: 'perforacion', rareza: 'poco_comun', prob: 0.04, icono: 'taladro',
    nombre: 'Perforación incompleta',
    detalle: 'El equipo no alcanzó a terminar todos los barrenos del turno.',
    humor: ['La plantilla del Excel era más optimista que el turno.', 'El reloj perforó más rápido que la barrenadora.'],
    efecto: () => ({ anular: 0.2, delta: { eficiencia: -8 } })
  },

  // --- Infraestructura ---
  {
    id: 'bomba_aire', categoria: 'infraestructura', rareza: 'poco_comun', prob: 0.06, icono: 'bomba',
    nombre: 'Falló la bomba de aire',
    detalle: 'Se cayó el aire comprimido y el ciclo se detuvo un buen rato.',
    humor: ['La bomba de aire se quedó sin aire.', 'Sin aire comprimido, hasta el ánimo se desinfla.'],
    efecto: () => ({ delta: { eficiencia: -8, avance: -4 } })
  },
  {
    id: 'interrupcion_operacional', categoria: 'infraestructura', rareza: 'comun', prob: 0.1, icono: 'reloj',
    nombre: 'Interrupción operacional',
    detalle: 'Una interrupción en la operación retrasó la tronadura.',
    humor: ['El turno se movió, y el ciclo con él.', 'Hubo una reunión de coordinación... y luego otra.'],
    efecto: () => ({ delta: { eficiencia: -9 } })
  },
  {
    id: 'equipo_reducido', categoria: 'infraestructura', rareza: 'poco_comun', prob: 0.04, icono: 'taladro',
    nombre: 'Menos equipos de los previstos',
    detalle: 'Hoy había menos equipos disponibles de los planificados.',
    humor: ['El plan decía tres equipos. La realidad contó uno.', 'Equipo disponible: el que no estaba en mantenimiento.'],
    efecto: () => ({ anular: 0.1, delta: { eficiencia: -5 } })
  },

  // --- Suministro ---
  {
    id: 'explosivo_incompleto', categoria: 'suministro', rareza: 'comun', prob: 0.1, icono: 'caja',
    nombre: 'No llegó todo el explosivo',
    detalle: 'La entrega de explosivo llegó incompleta y se cargó con menos de lo previsto.',
    humor: ['El explosivo decidió tomarse el día.', 'El camión llegó... pero no con todo lo pedido.'],
    efecto: () => ({ energia: 0.88 })
  },
  {
    id: 'almacen_menor', categoria: 'suministro', rareza: 'poco_comun', prob: 0.05, icono: 'caja',
    nombre: 'El almacén entregó menos',
    detalle: 'El cargado tuvo que hacerse con una configuración limitada.',
    humor: ['El almacén dice que eso era todo lo que había.', 'Stock disponible: lo que alcanzó.'],
    efecto: () => ({ energia: 0.8, delta: { eficiencia: -3 } })
  },

  // --- Ambiente ---
  {
    id: 'entra_agua', categoria: 'ambiente', rareza: 'comun', prob: 0.14, icono: 'agua', tipos: ['subterranea'],
    nombre: 'Entró agua a la zona',
    detalle: 'Entró agua al frente y parte de la carga se mojó.',
    humor: ['El agua llegó antes que el iniciador.', 'La voladura se mojó: el ANFO no está de acuerdo.'],
    aplica: (d) => d.humedad !== 'seco',
    modulo: ({ desafio }) => (desafio.humedad === 'muy_humedo' ? 1.4 : 1),
    efecto: ({ valores }) => (valores.explosivo.agua < 0.5
      ? { energia: 0.65, delta: { fragmentacion: -6 } }
      : { delta: { fragmentacion: -2, eficiencia: -2 } })
  },
  {
    id: 'filtracion_repentina', categoria: 'ambiente', rareza: 'raro', prob: 0.012, icono: 'agua', tipos: ['subterranea'],
    nombre: 'Filtración repentina',
    detalle: 'Un frente que parecía seco apareció húmedo a último momento.',
    humor: ['Nadie había visto agua aquí. Hasta hoy.', 'El informe geológico decía "seco". El frente decía otra cosa.'],
    aplica: (d) => d.humedad === 'seco',
    efecto: ({ valores }) => (valores.explosivo.agua < 0.5
      ? { energia: 0.7, delta: { fragmentacion: -5 } }
      : { delta: { eficiencia: -2 } })
  },
  {
    id: 'lluvia', categoria: 'ambiente', rareza: 'poco_comun', prob: 0.06, icono: 'lluvia', tipos: ['cielo_abierto'],
    nombre: 'Lluvia sobre el banco',
    detalle: 'La lluvia modificó las condiciones del banco justo antes de cargar.',
    humor: ['Pronóstico: soleado. Realidad: banco con charcos.'],
    efecto: ({ valores }) => (valores.explosivo.agua < 0.5 ? { energia: 0.75, delta: { fragmentacion: -5 } } : { delta: { eficiencia: -3 } })
  },

  // --- Voladura ---
  {
    id: 'iniciacion_parcial', categoria: 'voladura', rareza: 'poco_comun', prob: 0.05, icono: 'chispa',
    nombre: 'Problema de iniciación',
    detalle: 'Parte de la voladura no salió como estaba prevista.',
    humor: ['La voladura no salió como estaba en el Excel.', 'La secuencia de iniciación improvisó un poco.'],
    efecto: () => ({ anular: 0.1, delta: { avance: -5, fragmentacion: -4 } })
  },
  {
    id: 'energia_mal_distribuida', categoria: 'voladura', rareza: 'comun', prob: 0.1, icono: 'chispa',
    nombre: 'Distribución de energía deficiente',
    detalle: 'La energía no se repartió como se esperaba en el frente.',
    humor: ['La energía se repartió como el bono: no de forma pareja.', 'Hubo zonas con mucha energía y otras con apenas aplausos.'],
    efecto: () => ({ delta: { fragmentacion: -6, control: -4 } })
  },
  {
    id: 'fragmentacion_inesperada', categoria: 'voladura', rareza: 'poco_comun', prob: 0.06, icono: 'roca',
    nombre: 'Fragmentación inesperada',
    detalle: 'El material salió con un tamaño distinto del previsto.',
    humor: ['La roca tenía otros planes.', 'El material salió con ideas propias sobre su tamaño.'],
    efecto: () => ({ delta: { fragmentacion: -9 } })
  },
  {
    id: 'sobreexcavacion', categoria: 'voladura', rareza: 'poco_comun', prob: 0.06, icono: 'roca',
    nombre: 'Sobreexcavación',
    detalle: 'El contorno se pasó de la línea de diseño.',
    humor: ['El perfil se fue más allá del plano.', 'La sección quedó más generosa de lo diseñado.'],
    modulo: (ctx) => { const c = cargaRelativa(ctx); return c > 1.1 ? 2.2 : c < 0.9 ? 0.4 : 1 },
    efecto: () => ({ delta: { control: -12 } })
  },
  {
    id: 'exceso_energia', categoria: 'voladura', rareza: 'poco_comun', prob: 0.05, icono: 'chispa',
    nombre: 'Exceso de energía',
    detalle: 'Sobró energía: la voladura salió más fuerte de lo necesario.',
    humor: ['Energía para dar y regalar. Sobre todo regalar.'],
    modulo: (ctx) => (cargaRelativa(ctx) > 1.15 ? 3 : 0),
    efecto: () => ({ delta: { control: -8, fragmentacion: -3 } })
  },
  {
    id: 'flying_rocks', categoria: 'voladura', rareza: 'raro', prob: 0.02, icono: 'roca',
    nombre: 'Flying rocks detectado',
    detalle: 'Flying rocks detectado. Resultado penalizado.',
    humor: ['Flying rocks detectado: la roca viajó más de lo debido.', 'Algunas rocas se tomaron demasiado en serio lo de volar.'],
    modulo: (ctx) => (ctx.valores.burden < 0.9 * ctx.optimo.burden ? 3 : 1) * (cargaRelativa(ctx) > 1.1 ? 2 : 1),
    efecto: () => ({ delta: { control: -18, eficiencia: -2 } })
  },

  // --- Geología ---
  {
    id: 'fractura_inesperada', categoria: 'geologia', rareza: 'comun', prob: 0.14, icono: 'fractura',
    nombre: 'Fractura inesperada',
    detalle: 'Apareció una zona de fracturamiento que nadie había mapeado.',
    humor: ['No fue tu diseño. Fue la geología.', 'La geología tenía otros planes: apareció una zona de fracturamiento inesperada.'],
    efecto: () => ({ delta: { fragmentacion: -5, control: -4 } })
  },
  {
    id: 'zona_competente', categoria: 'geologia', rareza: 'comun', prob: 0.1, icono: 'roca',
    nombre: 'Zona más competente',
    detalle: 'El frente trajo una zona de roca más competente de lo previsto.',
    humor: ['La roca ganó esta ronda.', 'La roca se puso firme justo hoy.'],
    efecto: () => ({ optimo: { q: 1.15 } })
  },
  {
    id: 'zona_debil', categoria: 'geologia', rareza: 'comun', prob: 0.1, icono: 'roca',
    nombre: 'Zona más débil',
    detalle: 'El frente trajo una zona de roca más débil de lo previsto.',
    humor: ['La roca se ablandó sin avisar.', 'Parte del frente cedió con muy poca insistencia.'],
    efecto: () => ({ optimo: { q: 0.87 } })
  },
  {
    id: 'roca_responde_mejor', categoria: 'geologia', rareza: 'poco_comun', prob: 0.05, icono: 'roca',
    nombre: 'La roca respondió mejor',
    detalle: 'La roca respondió mejor de lo esperado.',
    humor: ['Hoy la roca estaba de buen humor.', 'La geología se portó: respondió mejor de lo esperado.'],
    positivo: true,
    efecto: () => ({ delta: { avance: 3, fragmentacion: 5 } })
  },
  {
    id: 'cambio_condicion', categoria: 'geologia', rareza: 'poco_comun', prob: 0.04, icono: 'fractura',
    nombre: 'Cambio de condición geológica',
    detalle: 'La condición geológica cambió a mitad del frente.',
    humor: ['El macizo cambió de opinión a mitad de camino.', 'El modelo geológico pide una actualización.'],
    efecto: () => ({ optimo: { burden: 0.92 } })
  },

  // --- Raros y extremadamente raros ---
  {
    id: 'plano_version_final', categoria: 'oficina', rareza: 'raro', prob: 0.015, icono: 'papel',
    nombre: 'Plano equivocado',
    detalle: 'Se perforó con la versión del plano que no era.',
    humor: ['El plano era el "final_v7_FINAL_definitivo".', 'La voladura no salió como estaba en el Excel.'],
    efecto: () => ({ optimo: { burden: 1.1, espaciamiento: 0.92 } })
  },
  {
    id: 'cambio_turno', categoria: 'oficina', rareza: 'raro', prob: 0.015, icono: 'reloj',
    nombre: 'Cambio de turno',
    detalle: 'La carga esperó al relevo del turno.',
    humor: ['El explosivo esperó el relevo. El ciclo también.'],
    efecto: () => ({ delta: { eficiencia: -7 } })
  },
  {
    id: 'veta_inesperada', categoria: 'geologia', rareza: 'raro', prob: 0.012, icono: 'gema',
    nombre: 'Veta inesperada',
    detalle: 'Apareció una veta que no estaba en el modelo: el geólogo está feliz.',
    humor: ['El geólogo no cabe de felicidad: apareció una veta.'],
    positivo: true,
    efecto: () => ({ delta: { eficiencia: 6 } })
  },
  {
    id: 'mecha_rebelde', categoria: 'voladura', rareza: 'raro', prob: 0.015, icono: 'chispa',
    nombre: 'La mecha no quería prender',
    detalle: 'La mecha tardó en prender y el ciclo perdió unos minutos.',
    humor: ['La mecha se hizo la difícil: el cigarro tuvo que insistir.', 'Hasta la mecha quería una segunda opinión antes de prender.'],
    efecto: () => ({ delta: { eficiencia: -5 } })
  },
  {
    id: 'visita_gerencia', categoria: 'oficina', rareza: 'extremo', prob: 0.008, icono: 'papel',
    nombre: 'Visita sorpresa de la gerencia',
    detalle: 'Visita sorpresa de la gerencia: se detuvo todo para la foto.',
    humor: ['Visita de la gerencia: todo se revisó dos veces. Y se fotografió tres.'],
    efecto: () => ({ delta: { eficiencia: -10 } })
  },
  {
    id: 'reinicio_generador', categoria: 'infraestructura', rareza: 'extremo', prob: 0.005, icono: 'bomba',
    nombre: 'Se reinició el generador',
    detalle: 'El generador de la zona se reinició y el ciclo empezó de nuevo.',
    humor: ['¿Lo apagaste y lo volviste a prender? El generador, sí.'],
    efecto: () => ({ delta: { eficiencia: -8, avance: -2 } })
  },
  {
    id: 'roca_perfecta', categoria: 'geologia', rareza: 'extremo', prob: 0.004, icono: 'gema',
    nombre: 'Roca de buen humor',
    detalle: 'El macizo cooperó como nunca: un frente de manual.',
    humor: ['Hoy la roca leyó el manual de diseño.'],
    positivo: true,
    efecto: () => ({ delta: { avance: 4, fragmentacion: 4, control: 4, eficiencia: 4 } })
  }
]

export const RAREZAS = {
  comun: { etiqueta: 'Común', minimo: 0.1, maximo: 0.2 },
  poco_comun: { etiqueta: 'Poco común', minimo: 0.03, maximo: 0.08 },
  raro: { etiqueta: 'Raro', minimo: 0.01, maximo: 0.02 },
  extremo: { etiqueta: 'Extremadamente raro', minimo: 0, maximo: 0.01 }
}
