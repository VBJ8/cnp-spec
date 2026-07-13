# Carta de Diseño de botstop.pro
### Principios rectores — v1.0

**Estado:** Documento fundacional, de referencia permanente.
**Propósito:** Este documento no describe funcionalidades. Describe los
principios que cualquier funcionalidad futura debe cumplir para seguir
siendo botstop. Cuando una decisión de producto entre en conflicto con
esta carta, la carta tiene prioridad — o se cambia la carta de forma
consciente y explícita, nunca por la vía de la excepción silenciosa.

---

## Principio fundacional: ética endógena, no exógena

botstop no aspira a comportarse bien y que un tercero lo confirme después.
botstop aspira a que **comportarse mal sea estructuralmente imposible o
inútil**, de modo que ningún vigilante externo — regulador, comité,
prensa, opinión pública — tenga que descubrir después si el sistema hizo
lo correcto.

La diferencia no es cosmética:

- **Ética exógena**: el sistema actúa según su propio interés; una
  autoridad externa evalúa el resultado a posteriori y sanciona si hace
  falta. La ética vive fuera del mecanismo, vigilándolo.
- **Ética endógena**: el mecanismo está construido de modo que actuar de
  mala fe sea más caro, más difícil o directamente imposible que actuar
  de buena fe. La ética es la física interna del sistema, no una capa de
  supervisión añadida.

Todo lo que sigue son formas concretas de perseguir la segunda, no la
primera.

---

## Los cinco compromisos

### 1. Regla ejecutada, no criterio humano en tiempo real

Ninguna decisión que afecte a un usuario o una empresa individual debe
depender de que una persona, en ese momento, juzgue el caso. Las reglas
se definen una vez, con antelación, de forma pública — y después se
ejecutan igual para todos, sin excepción puntual.

*Ejemplo ya implementado:* el checkpoint de cierre no lo decide una
persona revisando el caso; lo decide una comparación determinista entre
dos confirmaciones independientes.

### 2. Imposibilidad estructural, no prohibición por norma

Cuando sea posible, un comportamiento indeseado no debe estar
"prohibido" — debe ser **irrealizable** por el propio diseño del sistema.
Una norma que prohíbe hacer trampa requiere vigilancia eterna. Un diseño
que hace la trampa imposible no la requiere nunca.

*Ejemplo de diseño futuro:* en una subasta ciega de intención (IBP), una
empresa no puede pujar mejor que su competidor porque no existe ningún
canal por el que pueda conocer la oferta ajena — no porque se le haya
pedido que no mire.

### 3. Transparencia del mecanismo, no confianza en el resultado

botstop no le pide a nadie que confíe en que el sistema fue justo.
botstop publica cómo funciona el sistema para que cualquiera pueda
verificarlo por sí mismo. La confianza no se otorga — se comprueba.

*Aplicación permanente:* toda fórmula que determine reputación, tarifa o
prioridad debe ser pública y auditable. Ninguna fórmula de impacto
económico o reputacional para el usuario puede ser una caja negra,
aunque su implementación interna sea propiedad de botstop.

### 4. Consecuencia automática, no sanción decidida

Cuando un comportamiento merece una consecuencia (una tarifa más alta,
una pérdida de prioridad, una restricción de acceso), esa consecuencia
debe derivarse matemáticamente de datos de proceso verificables — nunca
de la decisión discrecional de una persona sobre un caso concreto,
por bien fundamentada que parezca esa decisión en el momento.

*Riesgo explícito a vigilar:* la primera vez que se contemple "hacer una
excepción manual" para un caso concreto — una empresa grande, una
situación urgente, una relación personal — se estará reintroduciendo la
ética exógena por la puerta de atrás. Toda excepción propuesta debe
convertirse en una regla nueva, pública y aplicable a todos, nunca en un
trato singular no documentado.

### 5. El propio sistema rinde cuentas con la misma vara que aplica a terceros

botstop no se sitúa por encima del juego que arbitra. Si un agente o
mecanismo de botstop emite un criterio (una recomendación, un veredicto,
una curación de ofertas), ese criterio debe quedar sujeto a la misma
medición de acierto y consecuencia que se aplica a cualquier empresa o
usuario de la red. Ningún componente de botstop está exento de ser
evaluado por sus propios resultados.

---

## Dónde vive, legítimamente, el juicio humano

Esta carta no pretende eliminar la subjetividad humana del diseño de
botstop — eso sería imposible y, además, no deseable. Decisiones como el
peso de una fórmula de reputación, el umbral mínimo de datos para mostrar
un score, o qué señales cuentan como "proceso verificable", son y seguirán
siendo decisiones humanas.

Lo que esta carta exige es **dónde** debe vivir esa decisión: en el
momento de diseñar la regla, de forma pública y con antelación — nunca en
el momento de aplicarla a un caso concreto, a puerta cerrada. Es la
diferencia entre legislar con reglas conocidas de antemano por todos y
juzgar caso por caso según criterio no escrito.

---

## Cómo usar esta carta

- Antes de implementar cualquier función que afecte a la tarifa, la
  reputación, el acceso o la prioridad de un usuario o empresa, se
  contrasta contra los cinco compromisos.
- Si una función no puede satisfacer alguno de los cinco, no se descarta
  automáticamente — pero se documenta explícitamente *por qué* se hace
  la excepción, y esa excepción se convierte ella misma en una regla
  pública, no en un antecedente silencioso.
- Esta carta se revisa y se versiona como cualquier otro documento de
  especificación (ver `SPEC.md`), nunca se modifica de forma implícita
  a través de decisiones de producto que la contradigan sin mencionarla.

---

*Este documento es la base de diseño interna de botstop.pro y puede
evolucionar. Cualquier cambio a los cinco compromisos debe hacerse de
forma consciente y explícita, con el mismo espíritu de transparencia que
exige el compromiso 3.*
