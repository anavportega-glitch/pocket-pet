
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

import { productos } from "../game/mascotaLogic";

export default function TiendaScreen({
  mascota,
  comprar,
  usar,
  volver,
  ocupado,
}) {
  return (
    <ScrollView contentContainerStyle={styles.contenedor}>

      <View style={styles.cabecera}>
        <TouchableOpacity
          onPress={volver}
          style={styles.botonVolver}
          accessibilityRole="button"
          accessibilityLabel="Volver al juego"
        >
          <Text style={styles.flechaVolver}>←</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>TIENDA</Text>

        <View style={styles.espacioDerecha} />
      </View>

      <Text style={styles.monedas}>
        {mascota.monedas} monedas
      </Text>

      <Text style={styles.subtitulo}>
        Compra alimentos para cuidar a {mascota.nombre}
      </Text>

      {productos.map((producto) => {
        const cantidad =
          mascota.inventario?.[producto.id] || 0;

        return (
          <View
            key={producto.id}
            style={styles.tarjeta}
          >
            <View style={styles.etiqueta}>
              <Text style={styles.nombre}>
                {producto.nombre}
              </Text>
            </View>

            <Text style={styles.detalle}>
              +{producto.comida} comida
            </Text>

            {producto.felicidad > 0 && (
              <Text style={styles.detalle}>
                +{producto.felicidad} felicidad
              </Text>
            )}

            <Text style={styles.precio}>
              {producto.precio} monedas
            </Text>

            <Text style={styles.cantidad}>
              En inventario: {cantidad}
            </Text>

            <View style={styles.botones}>
              <TouchableOpacity
                style={[
                  styles.boton,
                  (ocupado ||
                    mascota.monedas < producto.precio) &&
                    styles.desactivado,
                ]}
                disabled={
                  ocupado ||
                  mascota.monedas < producto.precio
                }
                onPress={() => comprar(producto)}
              >
                <Text style={styles.textoBoton}>
                  Comprar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.boton,
                  (ocupado || cantidad === 0) &&
                    styles.desactivado,
                ]}
                disabled={ocupado || cantidad === 0}
                onPress={() => usar(producto)}
              >
                <Text style={styles.textoBoton}>
                  Usar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    backgroundColor: "#FFF1F6",
    padding: 20,
    alignItems: "center",
  },

  cabecera: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },

  botonVolver: {
    width: 48,
    height: 44,
    backgroundColor: "#FFF5ED",
    borderWidth: 3,
    borderColor: "#AE648C",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  flechaVolver: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#713B60",
    lineHeight: 32,
  },

  titulo: {
    fontSize: 25,
    fontWeight: "900",
    color: "#713B60",
    textAlign: "center",
  },

  espacioDerecha: {
    width: 48,
  },

  monedas: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#A66B35",
    marginBottom: 10,
  },

  subtitulo: {
    color: "#8D5277",
    textAlign: "center",
    marginBottom: 20,
  },

  tarjeta: {
    width: "100%",
    backgroundColor: "#FFF9F0",
    borderWidth: 3,
    borderColor: "#C879A0",
    borderRadius: 15,
    padding: 16,
    marginBottom: 14,
    alignItems: "center",
  },

  etiqueta: {
    backgroundColor: "#F5B4D0",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#A85D86",
    marginBottom: 12,
  },

  nombre: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#713B60",
  },

  detalle: {
    color: "#8D5277",
    marginTop: 5,
  },

  precio: {
    color: "#A66B35",
    fontWeight: "bold",
    marginTop: 10,
  },

  cantidad: {
    color: "#713B60",
    marginVertical: 12,
  },

  botones: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },

  boton: {
    flex: 1,
    backgroundColor: "#F5B4D0",
    borderWidth: 2,
    borderColor: "#A85D86",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },

  desactivado: {
    opacity: 0.45,
  },

  textoBoton: {
    color: "#713B60",
    fontWeight: "bold",
  },
});
