
import { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { crearMascota } from "../game/mascotaLogic";

export default function CrearMascotaScreen() {
  const [nombre, setNombre] = useState("");
  const [cargando, setCargando] = useState(false);

  async function guardar() {
    if (!nombre.trim()) {
      Alert.alert("Error", "Ponle un nombre a tu mascota");
      return;
    }

    if (!auth.currentUser) {
      Alert.alert("Error", "Debes iniciar sesión primero");
      return;
    }

    setCargando(true);

    try {
      const mascota = crearMascota(nombre.trim());

      await setDoc(
        doc(db, "usuarios", auth.currentUser.uid),
        mascota
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.contenedor}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>
        ¡Adopta tu mascota!
      </Text>

      <Image
        source={require("../../assets/sprites/mishi_normal.png")}
        style={styles.gato}
        resizeMode="contain"
      />

      <Text style={styles.texto}>
        ¿Cómo quieres llamar a tu pequeño amigo?
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre de tu mascota"
        placeholderTextColor="#B68AA0"
        value={nombre}
        onChangeText={setNombre}
        maxLength={20}
        autoCapitalize="sentences"
        editable={!cargando}
      />

      <TouchableOpacity
        style={[
          styles.boton,
          cargando && styles.botonDesactivado,
        ]}
        onPress={guardar}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.textoBoton}>
            Adoptar ♡
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    backgroundColor: "#FFF0F5",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  titulo: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#8B4567",
    textAlign: "center",
    marginBottom: 20,
  },

  gato: {
    width: 170,
    height: 170,
    marginVertical: 25,
    alignSelf: "center",
  },

  texto: {
    textAlign: "center",
    fontSize: 16,
    color: "#8B4567",
    marginBottom: 20,
  },

  input: {
    width: "100%",
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#E9B4CB",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
    color: "#713B60",
  },

  boton: {
    width: "100%",
    backgroundColor: "#D985AC",
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#A85D86",
  },

  botonDesactivado: {
    opacity: 0.6,
  },

  textoBoton: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
  },
});
