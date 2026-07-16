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

- **Importe:** fijo, no porcentual. Por defecto **30€** (o su
  equivalente en la moneda asignada al usuario — ver §7).
- **Configurabilidad:** el importe por defecto es ajustable a nivel de
  plataforma; no se contempla, en esta versión, que cada usuario fije su
  propio importe (a diferencia del extinto peaje de acceso).
- **Hecho generador del cobro:** el cierre de una negociación confirmado
  por ambas partes a través del checkpoint de cierre ya existente
  (`closureStatus: "closed_agreed"`). Sin doble confirmación, no hay
  cobro.

### 3.1 Verificación de sostenibilidad (con el importe por defecto)

| Concepto | Importe |
|---|---|
| Tarifa bruta | 30,00 € |
| Comisión de pasarela de pago (≈2,9% + 0,30) | ≈1,17 € |
| Reparto a fondo de regalías (70% del bruto) | 21,00 € |
| Reparto a plataforma (30% del bruto) | 9,00 € |
| **Margen neto de plataforma** (tras comisión) | **≈7,83 €** |

Este cálculo debe repetirse cada vez que se ajuste el importe por
defecto, para confirmar que el margen neto de plataforma permanece
positivo tras la comisión de la pasarela de pago.

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

- Importe por defecto de la tarifa por éxito (30€).
- Porcentaje de reparto plataforma/regalías (30%/70%).
- Ventana de caducidad de bloques pendientes (12 meses).
- Límite máximo de recomendados por usuario (valor exacto pendiente de
  fijar).

---

*Este documento define el modelo económico de botstop.pro y debe
mantenerse actualizado conforme el modelo evolucione con datos reales de
uso. Cualquier divergencia entre este documento y el comportamiento real
del sistema debe tratarse como un defecto a corregir — en el código o en
el documento, pero nunca dejarse sin resolver.*
