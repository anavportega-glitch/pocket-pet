
import { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Alert,
  AppState,
} from "react-native";

import { doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

import { auth, db } from "../services/firebase";

import {
  alimentar,
  jugar,
  dormir,
  actualizarMascota,
  comprarProducto,
  usarProducto,
} from "../game/mascotaLogic";

import TiendaScreen from "./TiendaScreen";

const sprites = {
  normal: require("../../assets/sprites/mishi_normal.png"),
  feliz: require("../../assets/sprites/mishi_feliz.png"),
  triste: require("../../assets/sprites/mishi_triste.png"),
  dormido: require("../../assets/sprites/mishi_dormido.png"),
};

export default function GameScreen({ datos }) {
  const [mascota, setMascota] = useState(datos);
  const [mensaje, setMensaje] = useState("¡Cuídame mucho!");
  const [estado, setEstado] = useState("normal");
  const [pantalla, setPantalla] = useState("juego");
  const [ocupado, setOcupado] = useState(false);

  const movimiento = useRef(new Animated.Value(0)).current;
  const bloqueo = useRef(false);
  const mascotaRef = useRef(datos);
  const expresionTimer = useRef(null);
  const actualizando = useRef(false);

  useEffect(() => {
    if (bloqueo.current || actualizando.current) {
      return;
    }

    mascotaRef.current = datos;
    setMascota(datos);
  }, [datos]);

  useEffect(() => {
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.timing(movimiento, {
          toValue: -6,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(movimiento, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );

    animacion.start();

    return () => {
      animacion.stop();

      if (expresionTimer.current) {
        clearTimeout(expresionTimer.current);
      }
    };
  }, [movimiento]);

  useEffect(() => {
    actualizarTiempo();

    const intervalo = setInterval(() => {
      actualizarTiempo();
    }, 60000);

    const suscripcion = AppState.addEventListener(
      "change",
      (estadoApp) => {
        if (estadoApp === "active") {
          actualizarTiempo();
        }
      }
    );

    return () => {
      clearInterval(intervalo);
      suscripcion.remove();
    };
  }, []);

  async function actualizarTiempo() {
    if (
      bloqueo.current ||
      actualizando.current ||
      !auth.currentUser
    ) {
      return;
    }

    const actual = mascotaRef.current;
    const nueva = actualizarMascota(actual);

    if (nueva === actual) {
      return;
    }

    actualizando.current = true;
    bloqueo.current = true;
    setOcupado(true);

    try {
      await updateDoc(
        doc(db, "usuarios", auth.currentUser.uid),
        nueva
      );

      mascotaRef.current = nueva;
      setMascota(nueva);
    } catch (error) {
      console.log(
        "Error al actualizar tiempo:",
        error.message
      );
    } finally {
      bloqueo.current = false;
      actualizando.current = false;
      setOcupado(false);
    }
  }

  async function guardar(nueva, texto, expresion) {
    if (bloqueo.current || !auth.currentUser) {
      return;
    }

    bloqueo.current = true;
    setOcupado(true);

    try {
      await updateDoc(
        doc(db, "usuarios", auth.currentUser.uid),
        nueva
      );

      mascotaRef.current = nueva;
      setMascota(nueva);

      if (texto !== null) {
        setMensaje(texto);
      }

      if (expresion !== null) {
        setEstado(expresion);

        if (expresionTimer.current) {
          clearTimeout(expresionTimer.current);
        }

        expresionTimer.current = setTimeout(() => {
          setEstado("normal");
        }, 2500);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      bloqueo.current = false;
      setOcupado(false);
    }
  }

  function accion(tipo) {
    if (bloqueo.current) return;

    const actual = actualizarMascota(mascotaRef.current);

    if (tipo === "comer") {
      if (actual.monedas < 5) {
        Alert.alert(
          "Sin monedas",
          "Juega para ganar monedas"
        );
        return;
      }

      guardar(
        alimentar(actual),
        `${actual.nombre} ha comido`,
        "feliz"
      );
    }

    if (tipo === "jugar") {
      if (actual.energia < 15) {
        Alert.alert(
          "Sin energía",
          "Necesito descansar"
        );
        return;
      }

      guardar(
        jugar(actual),
        `${actual.nombre} está jugando`,
        "feliz"
      );
    }

    if (tipo === "dormir") {
      guardar(
        dormir(actual),
        `${actual.nombre} está durmiendo`,
        "dormido"
      );
    }
  }

  function comprar(producto) {
    if (bloqueo.current) return;

    const actual = actualizarMascota(mascotaRef.current);

    if (actual.monedas < producto.precio) {
      Alert.alert(
        "Sin monedas",
        "No tienes suficientes monedas"
      );
      return;
    }

    guardar(
      comprarProducto(actual, producto),
      `Has comprado ${producto.nombre}`,
      "feliz"
    );
  }

  function usar(producto) {
    if (bloqueo.current) return;

    const actual = actualizarMascota(mascotaRef.current);

    if (!(actual.inventario?.[producto.id] > 0)) {
      Alert.alert(
        "Inventario vacío",
        "Compra primero este alimento"
      );
      return;
    }

    guardar(
      usarProducto(actual, producto),
      `${actual.nombre} ha comido ${producto.nombre}`,
      "feliz"
    );
  }

  function barra(nombre, valor, color) {
    return (
      <View style={styles.fila}>
        <Text style={styles.etiqueta}>
          {nombre}
        </Text>

        <View style={styles.barraFondo}>
          <View
            style={{
              width: `${Math.max(
                0,
                Math.min(100, valor)
              )}%`,
              height: "100%",
              backgroundColor: color,
            }}
          />
        </View>

        <Text style={styles.porcentaje}>
          {valor}%
        </Text>
      </View>
    );
  }

  function boton(texto, tipo) {
    return (
      <TouchableOpacity
        style={styles.boton}
        disabled={ocupado}
        onPress={() => accion(tipo)}
      >
        <Text style={styles.textoBoton}>
          {texto}
        </Text>
      </TouchableOpacity>
    );
  }

  if (pantalla === "tienda") {
    return (
      <TiendaScreen
        mascota={mascota}
        comprar={comprar}
        usar={usar}
        ocupado={ocupado}
        volver={() => setPantalla("juego")}
      />
    );
  }

  let expresion = estado;

  if (estado === "normal") {
    if (mascota.energia <= 20) {
      expresion = "dormido";
    } else if (
      mascota.comida <= 20 ||
      mascota.felicidad <= 20
    ) {
      expresion = "triste";
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>

      <View style={styles.cabecera}>
        <Text style={styles.titulo}>
          POCKET PET
        </Text>

        <TouchableOpacity
          style={styles.botonSalir}
          onPress={() => signOut(auth)}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
        >
          <Text style={styles.textoSalir}>
            Salir
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.consola}>
        <View style={styles.marco}>
          <ImageBackground
            source={require("../../assets/sprites/habitacion.png")}
            style={styles.habitacion}
            resizeMode="stretch"
          >
            <Text style={styles.nombre}>
              {mascota.nombre}
            </Text>

            <Animated.Image
              source={sprites[expresion]}
              resizeMode="contain"
              style={[
                styles.mascotaImagen,
                {
                  transform: [
                    { translateY: movimiento },
                  ],
                },
              ]}
            />
          </ImageBackground>
        </View>

        <View style={styles.mensajeCaja}>
          <Text style={styles.mensaje}>
            {mensaje}
          </Text>
        </View>

        <View style={styles.estadisticas}>
          {barra(
            "Comida",
            mascota.comida,
            "#F18BAD"
          )}

          {barra(
            "Feliz",
            mascota.felicidad,
            "#C89BEB"
          )}

          {barra(
            "Energía",
            mascota.energia,
            "#F4C86D"
          )}
        </View>

        <Text style={styles.monedas}>
          {mascota.monedas} monedas
        </Text>

        <View style={styles.botones}>
          {boton("Comer", "comer")}
          {boton("Jugar", "jugar")}
          {boton("Dormir", "dormir")}
        </View>

        <TouchableOpacity
          style={styles.tiendaBoton}
          disabled={ocupado}
          onPress={() => setPantalla("tienda")}
        >
          <Text style={styles.tiendaTexto}>
            Abrir tienda
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    backgroundColor: "#FFF1F6",
    padding: 16,
    justifyContent: "center",
  },

  cabecera: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    width: "100%",
  },

  titulo: {
    fontSize: 27,
    fontWeight: "900",
    color: "#713B60",
    letterSpacing: 2,
    flexShrink: 1,
  },

  botonSalir: {
    backgroundColor: "#FFF5ED",
    borderWidth: 2,
    borderColor: "#AE648C",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginLeft: 10,
  },

  textoSalir: {
    color: "#713B60",
    fontWeight: "bold",
    fontSize: 14,
  },

  consola: {
    backgroundColor: "#F6B4D0",
    borderWidth: 5,
    borderColor: "#A85D86",
    borderRadius: 45,
    padding: 16,
  },

  marco: {
    borderWidth: 5,
    borderColor: "#8D5277",
    borderRadius: 15,
    overflow: "hidden",
  },

  habitacion: {
    height: 235,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  nombre: {
    position: "absolute",
    top: 9,
    fontSize: 20,
    fontWeight: "900",
    color: "#743F61",
    backgroundColor: "#FFF1F6",
    paddingHorizontal: 14,
    borderRadius: 8,
    overflow: "hidden",
  },

  mascotaImagen: {
    width: 125,
    height: 125,
    marginBottom: 12,
  },

  mensajeCaja: {
    backgroundColor: "#FFF7EE",
    borderWidth: 3,
    borderColor: "#BD779B",
    borderRadius: 12,
    marginTop: 14,
    padding: 10,
  },

  mensaje: {
    textAlign: "center",
    color: "#713B60",
    fontSize: 15,
    fontWeight: "bold",
  },

  estadisticas: {
    backgroundColor: "#FFF7EE",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#BD779B",
    marginTop: 14,
    padding: 12,
  },

  fila: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    gap: 8,
  },

  etiqueta: {
    width: 55,
    color: "#713B60",
    fontSize: 12,
    fontWeight: "bold",
  },

  barraFondo: {
    flex: 1,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#F2DEE7",
    borderWidth: 2,
    borderColor: "#9C6584",
    overflow: "hidden",
  },

  porcentaje: {
    width: 38,
    fontSize: 12,
    color: "#713B60",
    textAlign: "right",
  },

  monedas: {
    textAlign: "center",
    fontSize: 18,
    color: "#713B60",
    fontWeight: "900",
    marginVertical: 15,
  },

  botones: {
    flexDirection: "row",
    gap: 8,
  },

  boton: {
    flex: 1,
    backgroundColor: "#FFF5ED",
    borderWidth: 3,
    borderBottomWidth: 6,
    borderColor: "#AE648C",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  textoBoton: {
    color: "#713B60",
    fontWeight: "900",
    fontSize: 14,
  },

  tiendaBoton: {
    backgroundColor: "#D985AC",
    borderWidth: 3,
    borderColor: "#A85D86",
    borderRadius: 14,
    padding: 15,
    marginTop: 16,
    alignItems: "center",
  },

  tiendaTexto: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
  },
});
