# Modelo Económico de botstop.pro
### v1.0 — Modelo de tarifa por éxito y regalías de recomendación

**Estado:** Definitivo en su estructura, pendiente de calibración con datos
reales de uso (parámetros como el importe por defecto, el tope de
recomendados, o la ventana de caducidad son ajustables sin alterar el
principio de fondo).
**Relación con otros documentos:** este modelo está diseñado para cumplir
los cinco compromisos de [`botstop-carta-de-diseno.md`](./botstop-carta-de-diseno.md).
Cualquier futura modificación de este modelo debe contrastarse contra esa
carta antes de implementarse.

---

## 1. Resumen del cambio de modelo

botstop.pro sustituye su modelo anterior de **peaje de acceso** (una
tarifa de 0,50–20 unidades monetarias pagada por la empresa remitente al
intentar contactar, repartida 70/30 con el usuario receptor) por un
modelo de **tarifa por éxito**: solo se cobra cuando una negociación
culmina en un acuerdo confirmado por ambas partes (ver checkpoint de
cierre, ya implementado).

El peaje de acceso queda **eliminado**. Ninguna empresa paga nada por el
mero hecho de intentar contactar; el coste solo existe si la negociación
prospera de verdad.

## 2. Motivación del cambio

El peaje de acceso, en su tarifa mínima configurable, generaba pérdida
neta real para la plataforma una vez descontada la comisión de la
pasarela de pago — un problema estructural, no ocasional, que empeoraba
cuanto más éxito tenía el producto. Además, cobrar por el simple acceso
reproducía la misma lógica que este proyecto nació para superar: pagar
por la posibilidad de ser visto, no por el resultado. El modelo de tarifa
por éxito resuelve ambos problemas a la vez.

## 3. Tarifa por operación exitosa

### 3.1 Estructura de dos tramos

La tarifa no es un importe fijo puro ni un porcentaje puro: es una
estructura de dos tramos con un único parámetro libre, diseñada para que
un acuerdo de bajo valor nunca pague una tarifa desproporcionada ni
quede en pérdida, sin reintroducir la complejidad de una tabla de tramos
discrecional.

```
Si el valor declarado del acuerdo < 300€:
    Tarifa = 10% del valor declarado
En cualquier otro caso:
    Tarifa = 30€ fijos
```

- **Tarifa fija de referencia:** 30€ (o su equivalente en la moneda
  asignada al usuario — ver §7). Se aplica a todo acuerdo cuyo valor
  declarado sea igual o superior al punto de cruce.
- **Porcentaje del primer tramo:** 10% del valor declarado del acuerdo,
  aplicado únicamente a acuerdos por debajo del punto de cruce.
- **Punto de cruce:** se deriva matemáticamente de los dos parámetros
  anteriores (tarifa fija ÷ porcentaje del primer tramo = 30€ ÷ 10% =
  **300€**), no es un tercer valor elegido de forma independiente.
- **Configurabilidad:** el importe fijo y el porcentaje del primer tramo
  son ajustables a nivel de plataforma; el punto de cruce se recalcula
  automáticamente a partir de ambos, nunca se fija de forma manual e
  independiente.
- **Hecho generador del cobro:** el cierre de una negociación confirmado
  por ambas partes a través del checkpoint de cierre ya existente
  (`closureStatus: "closed_agreed"`). Sin doble confirmación, no hay
  cobro.
- **Valor declarado del acuerdo:** requiere que el checkpoint de cierre
  capture también el valor económico del acuerdo (no solo el hecho
  binario de que hubo acuerdo), declarado por ambas partes — nunca
  autodeclarado unilateralmente sin contraste, para evitar que una parte
  declare un valor artificialmente bajo solo para pagar menos tarifa.

### 3.2 Por qué solo dos tramos, y no una tabla más granular

Una tabla con múltiples tramos y porcentajes distintos (evaluada y
descartada durante el diseño de este modelo) introduce fronteras
elegidas de forma discrecional y difíciles de justificar una a una,
además de resultar más compleja de comunicar y auditar. La estructura de
dos tramos aquí definida tiene una única variable libre (el porcentaje
del primer tramo); todo lo demás, incluido el punto de cruce, se deriva
matemáticamente de esa variable y de la tarifa fija — coherente con el
Compromiso 3 de la Carta de Diseño (transparencia del mecanismo: una
regla simple y calculable por cualquiera, no una tabla que exige
consultar múltiples casillas).

No se añade un tercer tramo para acuerdos de muy alto valor. El coste
real de mediar y verificar un acuerdo (checkpoint de cierre, cálculo de
reputación, etc.) no crece con el tamaño económico del acuerdo cerrado;
cobrar más solo porque el acuerdo es grande no correspondería a ningún
coste real adicional de la plataforma — reproduciría el mismo defecto ya
identificado y rechazado en el diseño de las regalías de recomendación
(§5.1): una cifra sin correspondencia con un evento verificado.

### 3.3 Verificación de sostenibilidad (con la tarifa fija de referencia)

| Concepto | Importe |
|---|---|
| Tarifa bruta | 30,00 € |
| Comisión de pasarela de pago (≈2,9% + 0,30) | ≈1,17 € |
| Reparto a fondo de regalías (70% del bruto) | 21,00 € |
| Reparto a plataforma (30% del bruto) | 9,00 € |
| **Margen neto de plataforma** (tras comisión) | **≈7,83 €** |

Este cálculo debe repetirse cada vez que se ajuste la tarifa fija de
referencia o el porcentaje del primer tramo, para confirmar que el
margen neto de plataforma permanece positivo tras la comisión de la
pasarela de pago — de forma especialmente cuidadosa en el primer tramo,
donde importes bajos (ej. un acuerdo de 50€, tarifa de 5€) pueden
acercarse mucho más al coste fijo de la comisión de la pasarela.

### 3.4 Valor mínimo de acuerdo

Para acuerdos cuyo valor declarado sea inferior a **15€**, la
plataforma no ofrece el servicio de mediación de cierre — el mismo
criterio ya aplicado al extinto peaje de acceso, y por el mismo motivo:
por debajo de cierto valor, la comisión de la pasarela de pago consume
el margen de la plataforma hasta dejarlo en pérdida neta o en un margen
tan estrecho que cualquier variación menor (ajuste de comisión,
recargo por tarjeta internacional, redondeo) lo convertiría en pérdida
real.

**Verificación de sostenibilidad en el suelo mínimo:**

| Concepto | Importe |
|---|---|
| Valor del acuerdo (mínimo) | 15,00 € |
| Tarifa (10%, primer tramo) | 1,50 € |
| Share plataforma (30%) | 0,45 € |
| Comisión de pasarela de pago (≈2,9% + 0,30) | ≈0,3735 € |
| **Margen neto de plataforma** | **≈0,08 €** |

Este margen sigue siendo estrecho y debe vigilarse junto con el resto de
parámetros del modelo (§9): si el coste real de la pasarela de pago
aumenta, o si el volumen de transacciones en este rango es
proporcionalmente alto, este suelo debe revisarse al alza antes de que
se convierta en una fuente sistemática de pérdida, tal como ocurrió con
la tarifa mínima del extinto peaje de acceso.

## 4. Reparto: fondo de regalías de recomendación

Del ingreso bruto de cada operación exitosa:

- **70%** se destina al fondo de regalías de recomendación (§5).
- **30%** se destina a la plataforma (costes de infraestructura,
  impuestos, y margen operativo).

## 5. Mecanismo de regalías de recomendación

### 5.1 Principio: correspondencia exacta, nunca inflada

Cada unidad monetaria que un recomendador puede llegar a cobrar por la
actividad de sus recomendados debe corresponder, uno a uno, a una unidad
monetaria real generada por un cierre exitoso y verificado. **No existe
ningún multiplicador, exponente o factor de amplificación** sobre esa
correspondencia. Introducir uno reproduciría, con otro nombre, el mismo
defecto que motivó la eliminación del antiguo "0,25€ por propuesta
mediada": una cifra sin respaldo real en un evento verificado.

Esta decisión es una aplicación directa del Compromiso 4 de la Carta de
Diseño (consecuencia automática y derivada de datos verificables, nunca
de una fórmula discrecional).

### 5.2 El tope: actividad propia como llave de acceso

Un recomendador solo puede cobrar, de la regalía generada por la
actividad de sus recomendados, hasta el importe exacto que él mismo haya
generado con sus propios cierres exitosos.

**Ejemplo:**
- Ana recomienda a Bruno.
- Bruno cierra una operación de 30€ → genera 21€ de regalía potencial
  (70%) atribuible a Ana.
- Si Ana no ha cerrado ninguna operación propia, ese bloque de 21€ queda
  pendiente — no se le acredita todavía.
- Si Ana cierra una operación propia de 30€, desbloquea hasta 21€ de lo
  generado por su red (en este caso, el bloque completo de Bruno).
- El tope de Ana es la suma de todo lo que ella misma ha generado
  activamente; puede usarse para desbloquear regalía de cualquiera de
  sus recomendados, no de uno en particular.

Este mecanismo hace que la pura recomendación pasiva, sin actividad
propia, no genere ingreso — sin necesidad de prohibirlo por norma: es
estructuralmente inoperante (Compromiso 2 de la Carta de Diseño).

### 5.3 Incentivo a expandir la red, sin inflar cifras

El incentivo a recomendar a más personas no proviene de multiplicar el
importe por recomendado, sino de que **cada recomendado adicional
incrementa el volumen de regalía potencial en espera**, disponible en
cuanto el recomendador desbloquee tope suficiente con su propia
actividad. A más red, mayor el "depósito" pendiente de desbloqueo — el
incentivo a expandir la red permanece intacto sin necesidad de ninguna
cifra flotante sin correspondencia real.

### 5.4 Límite de recomendados por usuario

Existe un límite máximo al número de recomendados que un mismo usuario
puede tener vinculados. Su propósito es evitar la concentración
desproporcionada de derechos futuros de regalía en manos de muy pocos
usuarios ("efecto élite"), independientemente de su actividad real.

- El valor exacto de este límite es un parámetro de configuración de
  plataforma, no fijado en este documento.
- Cualquier valor elegido debe publicarse de forma pública y accesible
  (Compromiso 3 de la Carta de Diseño) — nunca aplicarse de forma oculta
  o distinta según el usuario.

### 5.5 Anonimato de los recomendados

El recomendador nunca ve la identidad de los recomendados cuya actividad
genera regalía en su marcador. Solo ve el importe agregado. Esto es
coherente con los principios de privacidad ya aplicados en el resto del
producto (alias de contacto, hash de destinatario en certificados) y
evita cualquier incentivo a presionar directamente a un recomendado
concreto.

### 5.6 El marcador

- **Presentación:** un único marcador global y acumulado por usuario,
  no un desglose por bloque o por recomendado.
- **Contenido:** el importe total pendiente de desbloqueo, generado por
  la actividad agregada y anónima de la red de recomendados del usuario.
- **Avisos de caducidad:** el marcador muestra notificaciones puntuales
  del tipo *"Quedan 40 días para que 21€ caduquen y se eliminen del
  marcador"* cuando un bloque individual se aproxima a su fecha límite
  (ver §5.7), sin desglosar el resto del saldo por bloques.

### 5.7 Caducidad de bloques pendientes

- Cada bloque de regalía generado (por cada cierre exitoso de un
  recomendado) tiene su propio plazo independiente de **12 meses** desde
  el momento en que se generó.
- Si, transcurridos los 12 meses, ese bloque concreto no ha sido
  desbloqueado por actividad propia suficiente del recomendador, el
  importe correspondiente a ese bloque caduca, se elimina del marcador,
  y pasa a la plataforma.
- La caducidad es **por bloque, no global**: la existencia de un bloque
  antiguo a punto de caducar no afecta al resto del saldo pendiente
  generado en otros momentos.
- El derecho a seguir generando y cobrando regalía de la actividad de
  la red de recomendados es **vitalicio** — no expira por el mero paso
  del tiempo (a diferencia de los bloques individuales no desbloqueados,
  que sí caducan según lo anterior).

## 6. Qué recibe el usuario que no recomienda ni cierra operaciones propias

Un usuario que solo recibe propuestas comerciales, sin recomendar a
nadie ni actuar como remitente en ninguna negociación, **no recibe
ninguna compensación monetaria directa** bajo este modelo. Su beneficio
es exclusivamente no pecuniario: soberanía verificable sobre su propio
espacio de atención.

Formas concretas en que ese beneficio debe hacerse tangible (a
desarrollar como funcionalidad, no forman parte normativa de este
documento económico):

- Constancia acumulada y visible de vetos ejercidos con efecto real
  (no una promesa de baja, sino una prueba verificable).
- Certificados de consentimiento/rechazo descargables, ya implementados,
  reencuadrados como evidencia de soberanía ejercida, no solo como
  trámite de cumplimiento para la empresa.
- Acceso a inteligencia colectiva agregada y anónima de la red (p. ej.
  patrones de rechazo de otros usuarios ante ofertas similares).
- Reputación propia acumulada (ver `SPEC.md` §11.5), utilizable como
  ventaja el día que el usuario mismo busque activamente a través de
  botstop.

## 7. Moneda

- La moneda de cobro se asigna de forma automática según el país de
  registro del usuario, replicando el criterio ya usado en el proyecto
  predecesor (ZAS).
- **No** se realiza conversión directa 1:1 entre monedas distintas al
  consolidar saldos: un importe cobrado en una moneda debe convertirse
  a la moneda de visualización del usuario mediante un tipo de cambio
  real, nunca sumarse directamente como si fueran unidades equivalentes.
- Este documento no define el proveedor ni la frecuencia de
  actualización del tipo de cambio a usar — queda como decisión de
  implementación técnica posterior.

## 8. Relación con mecanismos ya existentes

- **Checkpoint de cierre:** es el hecho generador del cobro (§3). No se
  modifica su lógica, solo se conecta a un evento de cobro real que
  antes no existía de forma automática.
- **Reputación bidireccional:** permanece sin cambios en su cálculo;
  puede en el futuro condicionar el acceso a ciertas categorías de
  negociación, pero no interviene en el cálculo de regalías descrito en
  este documento.
- **Peaje de acceso:** queda formalmente eliminado. Cualquier código,
  interfaz o colección de datos remanente de este mecanismo debe
  auditarse y retirarse siguiendo el mismo criterio aplicado a la
  limpieza de remanentes de ZAS ya realizada (ver historial de proyecto).

## 9. Parámetros abiertos a calibración futura

Los siguientes valores se establecen como punto de partida razonable,
no como cifras permanentes. Cualquier cambio debe hacerse de forma
pública y documentada, nunca de manera implícita:

- Tarifa fija de referencia (30€) y porcentaje del primer tramo (10%) —
  el punto de cruce (300€) se deriva automáticamente de ambos y no se
  fija de forma independiente.
- Valor mínimo de acuerdo para ofrecer mediación de cierre (15€).
- Porcentaje de reparto plataforma/regalías (30%/70%).
- Ventana de caducidad de bloques pendientes (12 meses).
- Límite máximo de recomendados por usuario (**50**, fijado como techo
  de prevención de fraude y carga operativa — no como mecanismo
  antidesigualdad, ya cubierto por la correspondencia exacta 1:1 de
  §5.1).

---

*Este documento define el modelo económico de botstop.pro y debe
mantenerse actualizado conforme el modelo evolucione con datos reales de
uso. Cualquier divergencia entre este documento y el comportamiento real
del sistema debe tratarse como un defecto a corregir — en el código o en
el documento, pero nunca dejarse sin resolver.*
