
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./src/services/firebase";

import LoginScreen from "./src/screens/LoginScreen";
import CrearMascotaScreen from "./src/screens/CrearMascotaScreen";
import GameScreen from "./src/screens/GameScreen";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [mascota, setMascota] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelarMascota = null;

    const cancelarAuth = onAuthStateChanged(auth, (user) => {
      if (cancelarMascota) {
        cancelarMascota();
        cancelarMascota = null;
      }

      setUsuario(user);
      setMascota(null);

      if (user) {
        setCargando(true);

        cancelarMascota = onSnapshot(
          doc(db, "usuarios", user.uid),
          (documento) => {
            setMascota(
              documento.exists() ? documento.data() : null
            );
            setCargando(false);
          },
          (error) => {
            console.log(error);
            setCargando(false);
          }
        );
      } else {
        setCargando(false);
      }
    });

    return () => {
      cancelarAuth();
      if (cancelarMascota) cancelarMascota();
    };
  }, []);

  if (cargando) {
    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
      }}>
        <ActivityIndicator size="large" color="#D985AC" />
      </View>
    );
  }

  if (!usuario) return <LoginScreen />;

  if (!mascota) return <CrearMascotaScreen />;

  return <GameScreen key={usuario.uid} datos={mascota} />;
}
