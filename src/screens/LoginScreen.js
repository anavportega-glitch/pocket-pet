
import { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../services/firebase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registro, setRegistro] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function entrar() {
    if (!email.trim() || !password) {
      Alert.alert("Aviso", "Completa todos los campos");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Aviso",
        "La contraseña debe tener al menos 6 caracteres"
      );
      return;
    }

    setCargando(true);

    try {
      if (registro) {
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
      } else {
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
      }
    } catch (error) {
      let mensaje = "No se pudo completar la operación";

      if (error.code === "auth/email-already-in-use") {
        mensaje = "Este correo ya está registrado";
      } else if (error.code === "auth/invalid-email") {
        mensaje = "El correo electrónico no es válido";
      } else if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        mensaje = "Correo o contraseña incorrectos";
      } else if (error.code === "auth/weak-password") {
        mensaje = "La contraseña es demasiado corta";
      } else if (error.code === "auth/network-request-failed") {
        mensaje = "Comprueba tu conexión a Internet";
      }

      Alert.alert("Error", mensaje);
    } finally {
      setCargando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.contenedor}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../../assets/sprites/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.titulo}>
          POCKET PET
        </Text>

        <Text style={styles.subtitulo}>
          Tu pequeña mascota virtual
        </Text>

        <View style={styles.tarjeta}>
          <Text style={styles.bienvenida}>
            {registro ? "Crear cuenta" : "Bienvenido"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#B68AA0"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#B68AA0"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[
              styles.boton,
              cargando && styles.botonDesactivado,
            ]}
            disabled={cargando}
            onPress={entrar}
          >
            <Text style={styles.textoBoton}>
              {cargando
                ? "Cargando..."
                : registro
                  ? "Registrarse"
                  : "Iniciar sesión"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={cargando}
            onPress={() => setRegistro(!registro)}
          >
            <Text style={styles.cambiar}>
              {registro
                ? "Ya tengo una cuenta"
                : "Crear una cuenta"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.pie}>
          Cuida, juega y crece con un Mishi
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: "#FFF1F6",
  },
  contenedor: {
    flexGrow: 1,
    padding: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 170,
    height: 170,
    marginBottom: 15,
  },
  titulo: {
    fontSize: 35,
    fontWeight: "900",
    color: "#713B60",
    letterSpacing: 3,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 17,
    color: "#A16B88",
    marginTop: 12,
    marginBottom: 35,
    textAlign: "center",
  },
  tarjeta: {
    width: "100%",
    backgroundColor: "#FFF9F0",
    borderWidth: 3,
    borderColor: "#C879A0",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  bienvenida: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#713B60",
    marginBottom: 25,
  },
  input: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#D8A0BB",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#713B60",
    marginBottom: 16,
  },
  boton: {
    width: "100%",
    backgroundColor: "#D985AC",
    borderWidth: 2,
    borderColor: "#A85D86",
    borderRadius: 12,
    padding: 17,
    alignItems: "center",
    marginTop: 10,
  },
  botonDesactivado: {
    opacity: 0.6,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  cambiar: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8D5277",
    marginTop: 28,
    marginBottom: 8,
  },
  pie: {
    fontSize: 15,
    color: "#A16B88",
    marginTop: 30,
    textAlign: "center",
  },
});
